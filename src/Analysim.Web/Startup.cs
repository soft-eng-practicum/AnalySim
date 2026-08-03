using System.Collections.Generic;
using Core.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;
using Microsoft.OpenApi;
using Web.Extensions;

namespace Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.ConfigureCors();

            services.ConfigureAuthorization();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "AnalySim API",
                    Version = "v1"
                });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter 'Bearer' followed by your JWT token (e.g. 'Bearer eyJhbGci...')"
                });

                c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecuritySchemeReference("Bearer", document, null),
                        new List<string>()
                    }
                });
            });


            services.ConfigureIdentity();

            services.ConfigureDatabase(Configuration);

            services.ConfigureJWT(Configuration);

            services.ConfigureSpa();

            services.ConfigureLoggerService();

            services.ConfigureMailService(Configuration);

            services.AddControllers(config =>
            {
                config.RespectBrowserAcceptHeader = true;
                config.ReturnHttpNotAcceptable = true;
            }).AddNewtonsoftJson(options =>
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore)
                .AddXmlDataContractSerializerFormatters();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerManager logger)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.ConfigureExceptionHandler(logger);
            app.UseHttpsRedirection();

            // Add MIME type for Jupyter Lite wheel files by creating a provider and add the .whl mapping
            var provider = new FileExtensionContentTypeProvider();
            provider.Mappings[".whl"] = "application/octet-stream";

            app.UseStaticFiles();

            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles(new StaticFileOptions
                {
                    ContentTypeProvider = provider
                });
            }

            app.UseCors("CorsPolicy");

            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.All
            });

            app.UseRouting();

            app.Use(async (context, next) =>
            {
                var method = context.Request.Method;
                var isUnsafeApiRequest = context.Request.Path.StartsWithSegments("/api")
                    && !HttpMethods.IsGet(method)
                    && !HttpMethods.IsHead(method)
                    && !HttpMethods.IsOptions(method)
                    && !HttpMethods.IsTrace(method);

                var usesAuthCookie = context.Request.Cookies.ContainsKey("analysim.access_token")
                    || context.Request.Cookies.ContainsKey("analysim.refresh_token");

                var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
                var isPublicAuthRequest = path == "/api/account/login"
                    || path == "/api/account/register"
                    || path == "/api/account/forgotpassword"
                    || path == "/api/account/changepassword"
                    || path == "/api/account/confirmemailpost";

                if (isUnsafeApiRequest && usesAuthCookie && !isPublicAuthRequest)
                {
                    var csrfCookie = context.Request.Cookies["XSRF-TOKEN"];
                    var csrfHeader = context.Request.Headers["X-XSRF-TOKEN"].FirstOrDefault();

                    if (string.IsNullOrWhiteSpace(csrfCookie)
                        || string.IsNullOrWhiteSpace(csrfHeader)
                        || !string.Equals(csrfCookie, csrfHeader, StringComparison.Ordinal))
                    {
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsJsonAsync(new { message = "Invalid CSRF token." });
                        return;
                    }
                }

                await next();
            });

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}"
                );
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }

            });
        }
    }
}
