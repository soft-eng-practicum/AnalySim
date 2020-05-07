using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using NeuroSimHub.Data;
using NeuroSimHub.Models;
using NeuroSimHub.ViewModels.Project;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace NeuroSimHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagController : ControllerBase
    {

        private readonly string storageConnString;
        private readonly ApplicationDbContext _dbContext;

        public TagController(IConfiguration config, ApplicationDbContext _dbContext)
        {
            storageConnString = config.GetConnectionString("AccessKey");
            this._dbContext = _dbContext;
        }

        // Post: /api/Tag/CreateTag
        [HttpPost("[action]")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> CreateTag([FromForm] ProjectTagViewModel formdata)
        {
            // Find Tag In Database
            Tag tag = _dbContext.Tag.FirstOrDefault(t => t.Name == formdata.TagName);

            // Create Tag If Not Found
            if (tag == null)
            {
                tag = new Tag
                {
                    Name = formdata.TagName
                };

                await _dbContext.Tag.AddAsync(tag);
                await _dbContext.SaveChangesAsync();
            }

            // Find ProjectTag In Database
            ProjectTag projectTag = _dbContext.ProjectTags.FirstOrDefault(pt => pt.ProjectID == formdata.ProjectID && pt.TagID == tag.TagID);

            // Create ProjectTag If Not Found
            if (projectTag == null)
            {

                // Add Tag To Project
                projectTag = new ProjectTag
                {
                    ProjectID = formdata.ProjectID,
                    TagID = tag.TagID
                };
            }
            else
            {
                return Conflict(new
                {
                    projectTag = projectTag,
                    message = "Project Tag Already Exist"
                });
            }

            // Add Tag to Project
            await _dbContext.ProjectTags.AddAsync(projectTag);
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                projectTag = projectTag,
                message = "Project User Successfully Created"
            });
        }

        // Get: /api/Tag/Read
        [HttpGet("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult Read()
        {

            var tags = _dbContext.ProjectTags.ToList();

            // Return Ok Status
            return Ok(new
            {
                tags = tags,
                message = "Recieved User Roles List."
            });
        }

        // Delete: /api/Tag/DeleteTag
        [HttpDelete("[action]")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> DeleteTag([FromForm] ProjectTagViewModel formdata)
        {
            // Find ProjectTag In Database
            ProjectTag projectTag = _dbContext.ProjectTags.FirstOrDefault(pt => pt.ProjectID == formdata.ProjectID && pt.Tag.Name == formdata.TagName);

            // Return Not Found Status If Not Found
            if (projectTag == null) return NotFound();

            // Remove Project Tag
            _dbContext.ProjectTags.Remove(projectTag);


            // Check If Last Tag
            var projectTagList = _dbContext.ProjectTags.Where(pt => pt.Tag.Name == formdata.TagName).ToList();

            // Delete Tag If No Connection Exist
            if (projectTagList.Count == 0)
            {
                var tag = _dbContext.Tag.Where(t => t.Name == formdata.TagName).FirstOrDefault();

                _dbContext.Tag.Remove(tag);

            }

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                projectTag = projectTag,
                message = "Project Tag Successfully Deleted"
            });
        }
    }
}
