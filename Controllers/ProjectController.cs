using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeuroSimHub.Data;
using NeuroSimHub.Models;

namespace NeuroSimHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {

        private readonly ApplicationDbContext _dbContext;

        public ProjectController(ApplicationDbContext _dbContext) 
        {
            this._dbContext = _dbContext;
        }

        // GET: api/Project/
        [HttpGet("[action]")]
        [Authorize(Policy = "RequireLoggedIn")]
        public IActionResult GetProject()
        {
            return Ok(_dbContext.Projects.ToList());
        }

        // POST: api/Project
        [HttpPost("[action]")]
        [Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> AddProduct([FromBody] ProjectModel formdata)
        {
            var newproject = new ProjectModel
            {
                ProductId = formdata.ProductId,
                Name = formdata.Name,
                Type = formdata.Type,
                Description = formdata.Description,
                Visibility = formdata.Visibility,
                DateCreated = formdata.DateCreated,
                LastUpdated = formdata.LastUpdated,
                Owner = formdata.Owner
            };

            await _dbContext.AddAsync(newproject);
            await _dbContext.SaveChangesAsync();

            return Ok();
        }

        // PUT: api/Project/id?
        [HttpPut("[action]")]
        [Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> UpdateProduct([FromRoute] int id, [FromBody] ProjectModel formdata)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var findProduct = _dbContext.Projects.FirstOrDefault(p => p.ProductId == id);

            if (findProduct == null)
            {
                return NotFound();
            }

            // If the product was found
            findProduct.ProductId = formdata.ProductId;
            findProduct.Name = formdata.Name;
            findProduct.Type = formdata.Type;
            findProduct.Description = formdata.Description;
            findProduct.Visibility = formdata.Visibility;
            findProduct.DateCreated = formdata.DateCreated;
            findProduct.LastUpdated = formdata.LastUpdated;
            findProduct.Owner = formdata.Owner;

            _dbContext.Entry(findProduct).State = EntityState.Modified;

            await _dbContext.SaveChangesAsync();

            return Ok(new JsonResult("The Project with id " + id + "is updated"));

        }

        // DELETE: api/Project/id?
        [HttpDelete("[action]")]
        [Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> DeleteProject([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var findProduct = await _dbContext.Projects.FindAsync(id);

            if (findProduct == null)
            {
                return NotFound();
            }

            _dbContext.Projects.Remove(findProduct);

            await _dbContext.SaveChangesAsync();

            return Ok(new JsonResult("The Product with id " + id + " is Deleted."));

        }

    }
}
