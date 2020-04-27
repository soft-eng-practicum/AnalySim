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

            // Composite Key For Many To Many Relationship ApplicationUserProject
            modelBuilder.Entity<ApplicationUserProject>().HasKey(aup => new { aup.ApplicationUserID, aup.ProjectID });

            // Many To Many Relationship (ApplicationUserProject -> ApplicationUser)
            modelBuilder.Entity<ApplicationUserProject>()
                        .HasOne<ApplicationUser>(au => au.ApplicationUser)
                        .WithMany(aup => aup.ApplicationUserProjects)
                        .HasForeignKey(sc => sc.ApplicationUserID);

            // Many To Many Relationship (ApplicationUserProject -> Project)
            modelBuilder.Entity<ApplicationUserProject>()
                        .HasOne<Project>(p => p.Project)
                        .WithMany(aup => aup.ApplicationUserProjects)
                        .HasForeignKey(sc => sc.ProjectID);

            // Unique Endpoint URL
            modelBuilder.Entity<ApplicationUserProject>()
                        .HasIndex(aup => aup.Route)
                        .IsUnique();

            // Many To Many Relationship (ApplicationUserProject -> Project)
            modelBuilder.Entity<ApplicationUserProject>()
                        .HasOne<Project>(p => p.Project)
                        .WithMany(aup => aup.ApplicationUserProjects)
                        .HasForeignKey(sc => sc.ProjectID);

            // One To Many Relationship (User -> Blob)
            modelBuilder.Entity<ApplicationUser>()
                        .HasMany(b => b.BlobFiles)
                        .WithOne(u => u.User);

            // One To Many Relationship (Project -> Blob)
            modelBuilder.Entity<Project>()
                        .HasMany(p => p.BlobFiles)
                        .WithOne(p => p.Project);

            // Create Identity Role
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
