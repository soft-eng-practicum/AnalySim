using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NeuroSimHub.Models;

namespace NeuroSimHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signManager;

        public AccountController(UserManager<IdentityUser> _userManager, SignInManager<IdentityUser> _signManager) 
        {
            this._userManager = _userManager;
            this._signManager = _signManager;
        }

        
        [HttpPost("action")]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel formdata) {
            
            //Hold Error
            List<string> errorList = new List<string>();

            var user = new IdentityUser
            {
                Email = formdata.EmailAddress,
                UserName = formdata.Username,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            var result = await _userManager.CreateAsync(user, formdata.Password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "Customer");

                return Ok(new { username = user.UserName, email = user.Email, status = 1, message = "Registration Successful" });
            }
            else
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                    errorList.Add(error.Description);
                }
            }

            return BadRequest(new JsonResult(errorList));

        }


    }
}
