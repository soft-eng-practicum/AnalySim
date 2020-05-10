﻿using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NeuroSimHub.Data;
using NeuroSimHub.Helpers;
using NeuroSimHub.Models;
using NeuroSimHub.ViewModels;

namespace NeuroSimHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signManager;
        private readonly AppSettings _appSettings;
        private readonly ApplicationDbContext _dbContext;

        public AccountController(UserManager<ApplicationUser> _userManager, SignInManager<ApplicationUser> _signManager, IOptions<AppSettings> _appSettings, ApplicationDbContext _dbContext) 
        {
            this._userManager = _userManager;
            this._signManager = _signManager;
            this._appSettings = _appSettings.Value;
            this._dbContext = _dbContext;
        }

        #region GET REQUEST
        /*
         * Type : GET
         * URL : /api/account/getprojectlist/
         * Param : {projectID}
         * Description: Get list of project user has connection to
         */
        [HttpGet("[action]/{projectID}")]
        public IActionResult GetProjectList([FromRoute] int projectID)
        {

            // Find User
            var user = _dbContext.Users
                .Where(u => u.Id == projectID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Grab Project List From User
            var query = user
                .SelectMany(c => _dbContext.Projects).ToList();



            // Return Ok Status
            return Ok(new 
            { 
                result = query,
                message = "User's Project Recieved"
            });
        }

        /*
         * Type : GET
         * URL : /api/account/getuserlist
         * Param : None
         * Description: Get list of all user
         */
        [HttpGet("[action]")]
        public IActionResult GetUserList()
        {
            // Query All User Into A List
            var query = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .ToList();

            return Ok(new
            {
                result = query,
                message = "User List Received"
            });
        }

        /*
         * Type : GET
         * URL : /api/account/read/
         * Param : {userID}
         * Description: Get user from their id
         */
        // Get: 
        [HttpGet("[action]/{userID}")]
        public IActionResult GetUser([FromRoute] int userID)
        {
            // Find User
            var user = _dbContext.Users.Where(u => u.Id == userID);
            if (user == null) NotFound(new { message = "User Not Found" });


            // Populate To Many List
            var query = user
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles);

            return Ok(new
            {
                result = query,
                message = "User Received"
            });
        }

        /*
         * Type : GET
         * URL : /api/account/search/
         * Param : {searchTerm}
         * Description: Filter and return search result
         */
        [HttpGet("[action]/{searchTerm}")]
        public IActionResult Search([FromRoute] string searchTerm)
        {
            // Split String Into Multiple Search Term
            var searchTermList = searchTerm.Split(" ");

            // Get List Of User
            var user = _dbContext.Users.ToList();

            // Set For User That Match
            var matchedUser = new HashSet<int>();

            // Look For User That Contains Any Of The Search Term
            foreach (ApplicationUser u in user)
            {
                foreach (string term in searchTermList)
                {
                    // Add To Matched User
                    if (u.UserName.ToLower().Contains(term)) { matchedUser.Add(u.Id); break; }
                }
            }

            // Find All The Matched User
            var query = _dbContext.Users
                .Where(u => matchedUser.Contains(u.Id))
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .ToList();

            // Return Ok Status
            return Ok(new
            {
                result = query,
                message = "Recieved Search Result."
            });
        }
        #endregion

        #region POST REQUEST
        /*
         * Type : POST
         * URL : /api/account/follow
         * Param : UserFollowViewModel
         * Description: Have a user follow another user
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> Follow([FromForm] UserFollowViewModel formdata)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(formdata.UserID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Find Follower
            var follower = await _dbContext.Users.FindAsync(formdata.FollowerID);
            if (follower == null) return NotFound(new { message = "Follower Not Found" });

            // Create Many To Many Connection
            var userFollower = new UserUser
            {
                UserID = formdata.UserID,
                FollowerID = formdata.FollowerID
            };

            // Add To Database
            await _dbContext.UserUsers.AddAsync(userFollower);

            // Save Change
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                result = userFollower,
                message = "User is now following " + user.UserName
            });
        }

        /*
         * Type : POST
         * URL : /api/account/register
         * Param : UserRegisterViewModel
         * Description: Register Account
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> Register([FromForm] UserRegisterViewModel formdata)
        {

            // Hold Error List
            List<string> errorList = new List<string>();

            // Create User Object
            var user = new ApplicationUser
            {
                Email = formdata.EmailAddress,
                UserName = formdata.Username,
                DateCreated = DateTime.Now,
                LastOnline = DateTime.Now,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            // Add User To Database
            var result = await _userManager.CreateAsync(user, formdata.Password);

            // If Successfully Created
            if (result.Succeeded)
            {
                // Add Role To User
                await _userManager.AddToRoleAsync(user, "Customer");

                // Return Ok Request
                return Ok(new
                {
                    username = user.UserName,
                    email = user.Email,
                    status = 1,
                    message = "Registration Successful"
                });
            }
            else
            {
                // Add Error To ErrorList
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                    errorList.Add(error.Description);
                }
            }

            // Return Bad Request Status With ErrorList
            return BadRequest(new JsonResult(errorList));
        }

        /*
         * Type : POST
         * URL : /api/account/login
         * Param : UserLoginViewModel
         * Description: Register Account
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> Login([FromForm] UserLoginViewModel formdata)
        {
            // Get The User
            var user = await _userManager.FindByNameAsync(formdata.Username);

            // Get The User Role
            var roles = await _userManager.GetRolesAsync(user);

            // Generate Key Token
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_appSettings.Secret));

            // Generate Expiration Time For Token
            double tokenExpiryTime = Convert.ToDouble(_appSettings.ExpireTime);

            // Check Login Status
            if (user != null && await _userManager.CheckPasswordAsync(user, formdata.Password))
            {
                // Create JWT Token Handler
                var tokenHandler = new JwtSecurityTokenHandler();

                // Create Token Descriptor
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(JwtRegisteredClaimNames.Sub, formdata.Username),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Role, roles.FirstOrDefault()),
                        new Claim("LoggedOn", DateTime.Now.ToString())
                    }),

                    SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature),
                    Issuer = _appSettings.Site,
                    Audience = _appSettings.Audience,
                    Expires = DateTime.UtcNow.AddMinutes(tokenExpiryTime)
                };

                // Create Token
                var token = tokenHandler.CreateToken(tokenDescriptor);

                // Update Last Online
                user.LastOnline = DateTime.Now;

                // Save Database Change
                await _dbContext.SaveChangesAsync();

                // Return OK Request
                return Ok(new
                {
                    token = tokenHandler.WriteToken(token),
                    expiration = token.ValidTo,
                    username = user.UserName,
                    userRole = roles.FirstOrDefault(),
                    userID = user.Id
                });

            }
            else
            {

                ModelState.AddModelError("", "Username/Password was not found");

                // Return Unauthorized Status If Unable To Login
                return Unauthorized(new
                {
                    LoginError = "Please Check the Login Creddentials - Invalid Username/Password was entered"
                });
            }
        }
        #endregion

        #region DELETE REQUEST
        /*
         * Type : DELETE
         * URL : /api/account/unfollow
         * Param : {userID}/{followerID}
         * Description: Have the follower unfollow the user
         */
        [HttpDelete("[action]/{userID}/{followerID}")]
        public async Task<IActionResult> Unfollow([FromRoute] int userID, [FromRoute] int followerID)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(userID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Find Follower
            var follower = await _dbContext.Users.FindAsync(followerID);
            if (follower == null) return NotFound(new { message = "Follower Not Found" });

            // Find Many To Many
            var userFollower = await _dbContext.UserUsers.FindAsync(user.Id, follower.Id);
            if (userFollower == null) return NotFound(new { message = "User Follower Connection Not FOund" });

            // Remove Project
            _dbContext.UserUsers.Remove(userFollower);

            // Save Change
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                result = userFollower,
                message = "Follower Successfully Delete"
            });
        }
        #endregion
    }

}
