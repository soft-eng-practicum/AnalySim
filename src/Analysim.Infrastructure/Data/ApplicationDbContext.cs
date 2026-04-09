using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Core.Entities;
using Analysim.Core.Entities;

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
            modelBuilder.Entity<NotebookContent>().HasKey(nc => new { nc.NotebookID, nc.Version });

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
                        .HasForeignKey(p => p.ProjectID)
                        .OnDelete(DeleteBehavior.Cascade);


            // One To Many Relationship (Project -> Notebook)
            modelBuilder.Entity<Project>()
                        .HasMany(p => p.Notebooks)
                        .WithOne(p => p.Project)
                        .HasForeignKey(p => p.ProjectID)
                        .OnDelete(DeleteBehavior.Cascade);

            // One To Many Relationship (Notebook -> NotebookContent)
            modelBuilder.Entity<Notebook>()
                        .HasMany(n => n.NotebookContents)
                        .WithOne(n => n.Notebook)
                        .HasForeignKey(n => n.NotebookID)
                        .OnDelete(DeleteBehavior.Cascade);

            // One To One Relationship (Blob -> BlobContent)
            modelBuilder.Entity<BlobFile>()
                        .HasMany(b => b.BlobFileContents)
                        .WithOne(b => b.BlobFile)
                        .HasForeignKey(b => b.BlobFileID)
                        .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<IdentityRole<int>>().HasData(
                new IdentityRole<int> { Id = 1, Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole<int> { Id = 2, Name = "Customer", NormalizedName = "CUSTOMER" },
                new IdentityRole<int> { Id = 3, Name = "Moderator", NormalizedName = "MODERATOR" }
            );

            // Many To One Relationship ( ObservableNotebookDataset -> Notebook)
            modelBuilder.Entity<ObservableNotebookDataset>()
                        .HasOne(d => d.notebook)
                        .WithMany(n => n.observableNotebookDatasets)
                        .HasForeignKey(d => d.NotebookID)
                        .OnDelete(DeleteBehavior.Cascade);

            #region Project Comments 

            // One To Many Relationship (Project -> ProjectComment)
            modelBuilder.Entity<Project>()
                        .HasMany(p => p.ProjectComments)
                        .WithOne(pc => pc.Project)
                        .HasForeignKey(pc => pc.ProjectID)
                        .OnDelete(DeleteBehavior.Cascade);

            // One To Many Relationship (User -> ProjectComment)
            modelBuilder.Entity<User>()
                        .HasMany(u => u.ProjectComments)
                        .WithOne(pc => pc.User)
                        .HasForeignKey(pc => pc.UserID)
                        .OnDelete(DeleteBehavior.Restrict);

            // Self Reference Relationship (ProjectComment -> Replies)
            modelBuilder.Entity<ProjectComment>()
                        .HasOne(pc => pc.ParentComment)
                        .WithMany(pc => pc.Replies)
                        .HasForeignKey(pc => pc.ParentCommentID)
                        .OnDelete(DeleteBehavior.Restrict);

            // ProjectCommentLike composite key
            modelBuilder.Entity<ProjectCommentLike>()
                        .HasKey(cl => new { cl.CommentID, cl.UserID });

            // One To Many Relationship (ProjectComment -> ProjectCommentLike)
            modelBuilder.Entity<ProjectCommentLike>()
                        .HasOne(cl => cl.ProjectComment)
                        .WithMany(pc => pc.CommentLikes)
                        .HasForeignKey(cl => cl.CommentID)
                        .OnDelete(DeleteBehavior.Cascade);

            // One To Many Relationship (User -> ProjectCommentLike)
            modelBuilder.Entity<ProjectCommentLike>()
                        .HasOne(cl => cl.User)
                        .WithMany(u => u.CommentLikes)
                        .HasForeignKey(cl => cl.UserID)
                        .OnDelete(DeleteBehavior.Cascade);

            // One To Many Relationship (ProjectComment -> ProjectCommentFlag)
            modelBuilder.Entity<ProjectCommentFlag>()
                        .HasOne(cf => cf.ProjectComment)
                        .WithMany(pc => pc.CommentFlags)
                        .HasForeignKey(cf => cf.CommentID)
                        .OnDelete(DeleteBehavior.Cascade);

            // One To Many Relationship (User -> ProjectCommentFlag)
            modelBuilder.Entity<ProjectCommentFlag>()
                        .HasOne(cf => cf.User)
                        .WithMany(u => u.CommentFlags)
                        .HasForeignKey(cf => cf.UserID)
                        .OnDelete(DeleteBehavior.Cascade);

            // Unique flag per user per comment
            modelBuilder.Entity<ProjectCommentFlag>()
                        .HasIndex(cf => new { cf.CommentID, cf.UserID })
                        .IsUnique();

            // Indexes for common lookups
            modelBuilder.Entity<ProjectComment>()
                        .HasIndex(pc => pc.ProjectID);

            modelBuilder.Entity<ProjectComment>()
                        .HasIndex(pc => pc.ParentCommentID);

            modelBuilder.Entity<ProjectCommentLike>()
                        .HasIndex(cl => cl.UserID);

            modelBuilder.Entity<ProjectCommentFlag>()
                        .HasIndex(cf => cf.UserID);

            #endregion
        }


        public DbSet<Tag> Tag { get; set; }
        public DbSet<BlobFile> BlobFiles { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectUser> ProjectUsers { get; set; }
        public DbSet<ProjectTag> ProjectTags { get; set; }
        public DbSet<UserUser> UserUsers { get; set; }

        public DbSet<Notebook> Notebook { get; set; }
        public DbSet<ObservableNotebookDataset> ObservableNotebookDataset { get; set; }
        public DbSet<NotebookContent> NotebookContent { get; set; }
        public DbSet<BlobFileContent> BlobFileContent { get; set; }

        public DbSet<ProjectComment> ProjectComments { get; set; }
        public DbSet<ProjectCommentLike> ProjectCommentLikes { get; set; }
        public DbSet<ProjectCommentFlag> ProjectCommentFlags { get; set; }
    }
}
