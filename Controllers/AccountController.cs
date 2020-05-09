using System;
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

        // Get: api/account/readproject/{id}
        //[Authorize(Policy = "RequireLoggedIn")]
        [HttpGet("[action]/{id}")]
        public IActionResult ReadProject([FromRoute] int id)
        {
            var query = _dbContext.Users
                .Where(u => u.Id == id)
                .SelectMany(c => _dbContext.Projects);

            return Ok(query);
        }

        // Get: api/account/read
        //[Authorize(Policy = "RequireLoggedIn")]
        [HttpGet("[action]")]
        public IActionResult Read()
        {
            var user = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles);

            return Ok(new
            {
                user = user,
                message = "User Received"
            });
        }

        // Get: api/account/read/{id}
        [HttpGet("[action]/{id}")]
        public async Task<IActionResult> Read([FromRoute] int id)
        {
            // Find User
            var user =_dbContext.Users.Where(u => u.Id == id)
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .ToList();

            if (user == null) return NotFound();
            return Ok(new
            {
                user = user,
                message = "User Received"
            });
        }

        // Post: api/account/follow
        //[Authorize(Policy = "RequireLoggedIn")]
        [HttpPost("[action]")]
        public async Task<IActionResult> Follow([FromForm] UserFollowViewModel formdata)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(formdata.UserID);
            if (user == null) return NotFound();

            // Find Follower
            var follower = await _dbContext.Users.FindAsync(formdata.FollowerID);
            if (follower == null) return NotFound();

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
                userFollower = userFollower,
                message = "User Received"
            });
        }

        // Delete: api/account/unfollow
        //[Authorize(Policy = "RequireLoggedIn")]
        [HttpDelete("[action]/{userID}/{followerID}")]
        public async Task<IActionResult> Unfollow([FromRoute] int userID, [FromRoute] int followerID)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(userID);
            if (user == null) return NotFound();

            // Find Follower
            var follower = await _dbContext.Users.FindAsync(followerID);
            if (follower == null) return NotFound();

            // Find Many To Many
            var userFollower = await _dbContext.UserUsers.FindAsync(user.Id, follower.Id);

            // Return Not Found Status If Not Found
            if (userFollower == null) return NotFound(new { message = "userFollower not found" });

            // Remove Project
            _dbContext.UserUsers.Remove(userFollower);

            // Save Change
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                userFollower = userFollower,
                message = "Follower Successfully Delete"
            });
        }

        // Get: /api/account/Search/{searchTerm}
        [HttpGet("[action]/{searchTerm}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult Search([FromRoute] string searchTerm)
        {
            // Split String Into Multiple Search Tag
            var searchTermList = searchTerm.Split(" ");

            // Get List Of Tag
            var user = _dbContext.Users.ToList();

            // Set For Tag That Match
            var matchedUser = new HashSet<int>();

            // Look For Tag That Contains Any Of The Term In TermList
            foreach (ApplicationUser u in user)
            {
                foreach (string term in searchTermList)
                {
                    // Add To Matched Tag
                    if (u.UserName.ToLower().Contains(term)) { matchedUser.Add(u.Id); break; }
                }
            }

            var userList = _dbContext.Users
                .Where(u => matchedUser.Contains(u.Id))
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .ToList();

            // Return Ok Status
            return Ok(new
            {
                user = userList,
                message = "Recieved Search Result."
            });
        }

        // POST: api/account/register
        [HttpPost("[action]")]
        public async Task<IActionResult> Register([FromForm] UserRegisterViewModel formdata) {
            
            // Hold Error List
            List<string> errorList = new List<string>();

            // Create User Object
            var user = new ApplicationUser
            {
                Email = formdata.EmailAddress,
                UserName = formdata.Username,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            // Create User To Database
            var result = await _userManager.CreateAsync(user, formdata.Password);

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
                // Add Error In Creating User TO List
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                    errorList.Add(error.Description);
                }
            }

            // Return Bad Request Status With ErrorList
            return BadRequest(new JsonResult(errorList));
        }

        // POST: api/account/login
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

    }

}
