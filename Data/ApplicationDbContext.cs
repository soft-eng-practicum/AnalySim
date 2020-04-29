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
                        .HasForeignKey(aup => aup.ApplicationUserID);

            // Many To Many Relationship (ApplicationUserProject -> Project)
            modelBuilder.Entity<ApplicationUserProject>()
                        .HasOne<Project>(p => p.Project)
                        .WithMany(aup => aup.ApplicationUserProjects)
                        .HasForeignKey(aup => aup.ProjectID);


            // Many To Many Relationship (ProjectTag -> Tag)
            modelBuilder.Entity<ProjectTag>()
                        .HasOne<Tag>(t => t.Tag)
                        .WithMany(pt => pt.ProjectTags)
                        .HasForeignKey(pt => pt.TagID);

            // Many To Many Relationship (ProjectTag -> Project)
            modelBuilder.Entity<ProjectTag>()
                        .HasOne<Project>(p => p.Project)
                        .WithMany(pt => pt.ProjectTags)
                        .HasForeignKey(pt => pt.ProjectID);

            // One To Many Relationship (User -> Blob)
            modelBuilder.Entity<ApplicationUser>()
                        .HasMany(b => b.BlobFiles)
                        .WithOne(u => u.User);

            // One To Many Relationship (Project -> Blob)
            modelBuilder.Entity<Project>()
                        .HasMany(p => p.BlobFiles)
                        .WithOne(p => p.Project);

            modelBuilder.Entity<ApplicationUserProject>().HasKey(aup => new { aup.ApplicationUserID, aup.ProjectID });
            modelBuilder.Entity<ProjectTag>().HasKey(pt => new { pt.ProjectID, pt.TagID });

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
        public DbSet<ProjectTag> ProjectTags { get; set; }


    }
}
