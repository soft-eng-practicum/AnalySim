using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Core.Entities;
using Analysim.Core.Entities;

namespace Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public DbSet<RefreshToken> RefreshTokens { get; set; }

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
            modelBuilder.Entity<UserNotificationPreference>().HasKey(p => new { p.UserID, p.NotificationType });

            modelBuilder.Entity<RefreshToken>()
                        .HasIndex(rt => rt.TokenHash)
                        .IsUnique();

            modelBuilder.Entity<RefreshToken>()
                        .HasIndex(rt => rt.UserID);

            modelBuilder.Entity<RefreshToken>()
                        .HasIndex(rt => rt.TokenFamilyID);

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

            modelBuilder.Entity<User>()
                        .HasMany(u => u.RefreshTokens)
                        .WithOne(rt => rt.User)
                        .HasForeignKey(rt => rt.UserID)
                        .OnDelete(DeleteBehavior.Cascade);

            #region Notifications

            modelBuilder.Entity<Notification>()
                        .HasOne(n => n.RecipientUser)
                        .WithMany()
                        .HasForeignKey(n => n.RecipientUserID)
                        .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                        .HasOne(n => n.ActorUser)
                        .WithMany()
                        .HasForeignKey(n => n.ActorUserID)
                        .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Notification>()
                        .HasOne(n => n.Project)
                        .WithMany()
                        .HasForeignKey(n => n.ProjectID)
                        .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Notification>()
                        .HasOne(n => n.ProjectComment)
                        .WithMany()
                        .HasForeignKey(n => n.CommentID)
                        .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Notification>()
                        .HasOne(n => n.ProjectLog)
                        .WithMany()
                        .HasForeignKey(n => n.ProjectLogID)
                        .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<UserNotificationPreference>()
                        .HasOne(p => p.User)
                        .WithMany()
                        .HasForeignKey(p => p.UserID)
                        .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                        .HasIndex(n => new { n.RecipientUserID, n.IsRead, n.CreatedAt });

            modelBuilder.Entity<Notification>()
                        .HasIndex(n => n.Type);

            modelBuilder.Entity<UserNotificationPreference>()
                        .HasIndex(p => p.NotificationType);

            #endregion

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
                new IdentityRole<int> { Id = 1, Name = "Admin", NormalizedName = "ADMIN", ConcurrencyStamp = "d7c6278e-3f78-4db6-8832-aa41ea9fd62c" },
                new IdentityRole<int> { Id = 2, Name = "Customer", NormalizedName = "CUSTOMER", ConcurrencyStamp = "7383e31e-a884-4cd6-82f7-a6287b4e30a5" },
                new IdentityRole<int> { Id = 3, Name = "Moderator", NormalizedName = "MODERATOR", ConcurrencyStamp = "398ef1f2-6b82-45f2-9601-ed2129f197e9" }
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

            #region Project Logs

            // One To Many Relationship (Project -> ProjectLog)
            modelBuilder.Entity<Project>()
                        .HasMany(p => p.ProjectLogs)
                        .WithOne(pl => pl.Project)
                        .HasForeignKey(pl => pl.ProjectID)
                        .OnDelete(DeleteBehavior.Cascade);

            // One To Many Relationship (User -> ProjectLog)
            modelBuilder.Entity<User>()
                        .HasMany(u => u.ProjectLogs)
                        .WithOne(pl => pl.User)
                        .HasForeignKey(pl => pl.UserID)
                        .OnDelete(DeleteBehavior.Restrict);

            // Optional One To Many Relationship (BlobFile -> ProjectLog)
            modelBuilder.Entity<ProjectLog>()
                        .HasOne(pl => pl.BlobFile)
                        .WithMany()
                        .HasForeignKey(pl => pl.BlobFileID)
                        .OnDelete(DeleteBehavior.SetNull);

            // Optional One To Many Relationship (Notebook -> ProjectLog)
            modelBuilder.Entity<ProjectLog>()
                        .HasOne(pl => pl.ReferencedNotebook)
                        .WithMany()
                        .HasForeignKey(pl => pl.ReferencedNotebookID)
                        .OnDelete(DeleteBehavior.SetNull);

            // One To Many Relationship (ProjectLog -> ProjectComment)
            modelBuilder.Entity<ProjectLog>()
                        .HasMany(pl => pl.Comments)
                        .WithOne(pc => pc.ProjectLog)
                        .HasForeignKey(pc => pc.ProjectLogID)
                        .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectLog>()
                        .HasIndex(pl => pl.ProjectID);

            modelBuilder.Entity<ProjectLog>()
                        .HasIndex(pl => pl.UserID);

            modelBuilder.Entity<ProjectComment>()
                        .HasIndex(pc => pc.ProjectLogID);

            modelBuilder.Entity<ProjectLog>()
                .HasIndex(pl => pl.ReferencedNotebookID);

            #endregion
            
            // One To Many Relationship (Project -> Publication)
            modelBuilder.Entity<Project>()
                        .HasMany(p => p.Publications)
                        .WithOne(pp => pp.Project)
                        .HasForeignKey(pp => pp.ProjectID)
                        .OnDelete(DeleteBehavior.Cascade);
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
        public DbSet<ProjectLog> ProjectLogs { get; set; }

        public DbSet<Publication> Publications { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<UserNotificationPreference> UserNotificationPreferences { get; set; }
    }
}
