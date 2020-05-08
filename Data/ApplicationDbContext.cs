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
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite Key For Many To Many Relationship
            modelBuilder.Entity<ProjectUser>().HasKey(pu => new { pu.UserID, pu.ProjectID });
            modelBuilder.Entity<ProjectTag>().HasKey(pt => new { pt.ProjectID, pt.TagID });
            modelBuilder.Entity<UserUser>().HasKey(uu => new { uu.UserID, uu.FollowerID });

            // Many To Many Relationship (ProjectUser -> ApplicationUser)
            modelBuilder.Entity<ProjectUser>()
                        .HasOne<ApplicationUser>(i => i.User)
                        .WithMany(pu => pu.ProjectUsers)
                        .HasForeignKey(pu => pu.UserID);

            // Many To Many Relationship (ProjectUser -> Project)
            modelBuilder.Entity<ProjectUser>()
                        .HasOne<Project>(p => p.Project)
                        .WithMany(pu => pu.ProjectUsers)
                        .HasForeignKey(pu => pu.ProjectID);

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

            // One To Many Relationship (ApplicationUser -> Blob)
            modelBuilder.Entity<ApplicationUser>()
                        .HasMany(b => b.BlobFiles)
                        .WithOne(u => u.User);

            // One To Many Relationship (Project -> Blob)
            modelBuilder.Entity<Project>()
                        .HasMany(p => p.BlobFiles)
                        .WithOne(p => p.Project);

            // Many To Many Relationship (UserUser -> User)
            modelBuilder.Entity<UserUser>()
                        .HasOne<ApplicationUser>(uu => uu.User)
                        .WithMany(u => u.Followers)
                        .HasForeignKey(uu => uu.UserID);

            // Many To Many Relationship (UserUser -> User)
            modelBuilder.Entity<UserUser>()
                        .HasOne<ApplicationUser>(uu => uu.Follower)
                        .WithMany(u => u.Following)
                        .HasForeignKey(uu => uu.FollowerID);



            // Create Identity Role
            modelBuilder.Entity<IdentityRole>().HasData(
                new { Id = "1", Name = "Admin", NormalizedName = "ADMIN"},
                new { Id = "2", Name = "Customer", NormalizedName = "CUSTOMER" },
                new { Id = "3", Name = "Moderator", NormalizedName = "MODERATOR" }
            );
        }

        
        public DbSet<Tag> Tag { get; set; }
        public DbSet<BlobFile> BlobFiles { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectUser> ProjectUsers { get; set; }
        public DbSet<ProjectTag> ProjectTags { get; set; }
        public DbSet<UserUser> UserUsers { get; set; }





    }
}
