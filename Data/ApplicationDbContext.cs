using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NeuroSimHub.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUserProject>().HasKey(aup => new { aup.ApplicationUserID, aup.ProjectID });

            modelBuilder.Entity<ApplicationUserProject>()
                .HasOne<ApplicationUser>(au => au.ApplicationUser)
                .WithMany(aup => aup.ApplicationUserProjects)
                .HasForeignKey(sc => sc.ApplicationUserID);


            modelBuilder.Entity<ApplicationUserProject>()
                .HasOne<Project>(p => p.Project)
                .WithMany(aup => aup.ApplicationUserProjects)
                .HasForeignKey(sc => sc.ProjectID);

            modelBuilder.Entity<ApplicationUser>()
                .HasMany(b => b.BlobFiles)
                .WithOne(u => u.User)
                .IsRequired();

            modelBuilder.Entity<Project>()
                .HasMany(p => p.BlobFiles)
                .WithOne(p => p.Project)
                .IsRequired();

            modelBuilder.Entity<IdentityRole>().HasData(
                new { Id = "1", Name = "Admin", NormalizedName = "ADMIN"},
                new { Id = "2", Name = "Customer", NormalizedName = "CUSTOMER" },
                new { Id = "3", Name = "Moderator", NormalizedName = "MODERATOR" }
            );
        }

        public DbSet<ApplicationUserProject> ApplicationUserProjects { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<BlobFile> BlobFiles { get; set; }


    }
}
