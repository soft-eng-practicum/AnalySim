﻿using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Core.Entities;

namespace Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<int>, int>
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

            // Many To Many Relationship (ProjectUser -> User)
            modelBuilder.Entity<ProjectUser>()
                        .HasOne<User>(i => i.User)
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

            // Many To Many Relationship (UserUser -> User)
            modelBuilder.Entity<UserUser>()
                        .HasOne<User>(uu => uu.User)
                        .WithMany(u => u.Followers)
                        .HasForeignKey(uu => uu.UserID);

            // Many To Many Relationship (UserUser -> User)
            modelBuilder.Entity<UserUser>()
                        .HasOne<User>(uu => uu.Follower)
                        .WithMany(u => u.Following)
                        .HasForeignKey(uu => uu.FollowerID);

            // One To Many Relationship (User -> Blob)
            modelBuilder.Entity<User>()
                        .HasMany(u => u.BlobFiles)
                        .WithOne(u => u.User)
                        .HasForeignKey(u => u.UserID);

            // One To Many Relationship (Project -> Blob)
            modelBuilder.Entity<Project>()
                        .HasMany(p => p.BlobFiles)
                        .WithOne(p => p.Project)
                        .HasForeignKey(p => p.ProjectID);


            // One To Many Relationship (Project -> Notebook)
            modelBuilder.Entity<Project>()
                        .HasMany(p => p.Notebooks)
                        .WithOne(p => p.Project)
                        .HasForeignKey(p => p.ProjectID);

            modelBuilder.Entity<IdentityRole<int>>().HasData(
                new IdentityRole<int> { Id = 1, Name = "Admin", NormalizedName = "ADMIN"},
                new IdentityRole<int> { Id = 2, Name = "Customer", NormalizedName = "CUSTOMER" },
                new IdentityRole<int> { Id = 3, Name = "Moderator", NormalizedName = "MODERATOR" }
            );

            modelBuilder.Entity<ObservableNotebookDataset>()
                        .HasOne(d=>d.notebook)
                        .WithMany(n=>n.observableNotebookDatasets)
                        .HasForeignKey(d=>d.NotebookID)
                        .OnDelete(DeleteBehavior.Cascade);
        }

        
        public DbSet<Tag> Tag { get; set; }
        public DbSet<BlobFile> BlobFiles { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectUser> ProjectUsers { get; set; }
        public DbSet<ProjectTag> ProjectTags { get; set; }
        public DbSet<UserUser> UserUsers { get; set; }

        public DbSet<Notebook> Notebook {get;set;}





    }
}
