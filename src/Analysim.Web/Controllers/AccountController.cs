using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Core.Entities;
using Core.Helper;
using Core.Interfaces;
using Core.Services;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MailKit.Net.Smtp;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Web;
using System.Threading.Tasks;
using Web.ViewModels.Account;
using Web.ViewModels;
using Newtonsoft.Json;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly JwtSettings _jwtSettings;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signManager;
        private readonly ApplicationDbContext _dbContext;
        private readonly IBlobService _blobService;
        private readonly ILoggerManager _loggerManager;
        private readonly IMailNetService _mailNetService;

        private readonly IConfiguration _configuration;

        public AccountController(IOptions<JwtSettings> jwtSettings, UserManager<User> userManager,
            SignInManager<User> signManager, ApplicationDbContext dbContext,
                                 IBlobService blobService, ILoggerManager loggerManager,
                                 IMailNetService mailNetService,IConfiguration configuration)
        {
            _jwtSettings = jwtSettings.Value;
            _userManager = userManager;
            _signManager = signManager;
            _dbContext = dbContext;
            _blobService = blobService;
            _loggerManager = loggerManager;
            _mailNetService = mailNetService;
            _configuration = configuration;
        }

        #region GET REQUEST
        /*
         * Type : GET
         * URL : /api/account/getuserbyid/
         * Description: Return User from id
         * Response Status: 200 Ok, 404 Not Found
         */
        [HttpGet("[action]/{id}")]
        public IActionResult GetUserByID([FromRoute] int id)
        {
            // Find User
            var user = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .SingleOrDefault(x => x.Id == id);
            if (user == null) return NotFound();
            // user.EmailConfirmed ;
            return Ok(new
            {
                result = user,
                message = "Recieved User: " + user.UserName
            });
        }

        /*
        * Type : GET
        * URL : /api/account/getuserbyname/
        * Description: Return User from username
        * Response Status: 200 Ok, 404 Not Found
        */
        [HttpGet("[action]/{username}")]
        public IActionResult GetUserByName([FromRoute] string username)
        {
            // Find User
            var user = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .SingleOrDefault(u => u.UserName == username);
            if (user == null) return NotFound(new { message = "User Not Found" });
            return Ok(new
            {
                result = user,
                message = "Recieved User: " + user.UserName
            });
        }

        /*
        * Type : GET
        * URL : /api/account/getuserrange?
        * Description: Return User(s) from list of id
        * Response Status: 200 Ok, 404 Not Found
        */
        [HttpGet("[action]")]
        public IActionResult GetUserRange([FromQuery(Name = "id")] List<int> ids)
        {
            // Find User
            var users = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .Where(u => ids.Contains(u.Id))
                .ToList();
            if (users.Count != ids.Count) return NotFound(new { message = "Contains Invalid User" });

            return Ok(new
            {
                result = users,
                message = "Recieved User Range"
            });
        }

        /*
         * Type : GET
         * URL : /api/account/getuserlist
         * Description: Return all User
         * Response Status: 200 Ok
         */
        [HttpGet("[action]")]
        public IActionResult GetUserList()
        {
            // Query All User Into A List
            var users = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .ToList();

            return Ok(new
            {
                result = users,
                message = "Recieved User List"
            });
        }

        /*
         * Type : GET
         * URL : /api/account/search?
         * Description: Return list of matched User from list of searchterms
         * Response Status: 200 Ok, 204 Not Found
         */
        [HttpGet("[action]")]
        public IActionResult Search([FromQuery(Name = "term")] List<string> searchTerms)
        {
            var matchedUser = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .ToList()
                .Where(u => searchTerms.All(k => u.UserName.ToLower().Contains(k.ToLower())));
            if (matchedUser.Count() == 0) return NoContent();

            return Ok(new
            {
                result = matchedUser,
                message = "Search Successful"
            });
        }
        #endregion

        #region POST REQUEST
        /*
         * Type : POST
         * URL : /api/account/follow
         * Description: Create and return new UserUser
         * Response Status: 200 Ok, 404 Not Found
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> Follow([FromForm] AccountFollowVM formdata)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(formdata.UserID);
            if (user == null) return NotFound(new { message = "User Not Found " + formdata.UserID });

            // Find Follower
            var follower = await _dbContext.Users.FindAsync(formdata.FollowerID);
            if (follower == null) return NotFound(new { message = "User Not Found " + formdata.UserID });

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
                message = follower.UserName + " is now following " + user.UserName
            });
        }

        /*
         * Type : POST
         * URL : /api/account/register
         * Description: Create and return new User
         * Response Status: 200 Ok, 400 Bad Request
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> Register([FromForm] AccountRegisterVM formdata)
        {

            // Hold Error List
            List<string> errorList = new List<string>();

            string registrationSurvey = formdata.RegistrationSurvey;

            string[] registrationKeys =  _configuration.GetSection("registrationCodes").Get<string[]>();

            dynamic registrationSurveyJson = JsonConvert.DeserializeObject(registrationSurvey);

            string registrationCode = registrationSurveyJson.registrationCode;

            Console.Write(registrationCode);

            if(registrationKeys != null && registrationKeys.Length != 0)
            {
                bool containsRegistrationCode = registrationKeys.Contains(registrationCode);

                if(!containsRegistrationCode)
                {
                    errorList.Add("Invalid Registration Code");
                    return BadRequest(new { message = errorList });
                }
            }


            // Create User Object
            var user = new User
            {
                Email = formdata.EmailAddress,
                UserName = formdata.Username,
                RegistrationSurvey = formdata.RegistrationSurvey,
                DateCreated = DateTimeOffset.UtcNow,
                LastOnline = DateTimeOffset.UtcNow,
                SecurityStamp = Guid.NewGuid().ToString()
            };



            // Add User To Database
            var result = await _userManager.CreateAsync(user, formdata.Password);

            // If Successfully Created
            if (result.Succeeded)
            {

                // generate email token
                var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var callbackUrl = Url.Action("ConfirmEmail", "Account", new
                {
                    userid = user.Id,
                    token = code,
                }, protocol: HttpContext.Request.Scheme);

                // send verification token
                var emailContent = "Please confirm your account by clicking this link: <a href=\"" + callbackUrl + "\">link</a>";
                await _mailNetService.SendEmail(user.Email, user.UserName, "Confirm your account", emailContent, emailContent);

                // Add Role To User
                await _userManager.AddToRoleAsync(user, "Customer");

                // Return Ok Request
                return Ok(new
                {
                    result = user,
                    message = $"Registration successful and confirmation email sent"
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
            return BadRequest(new { message = errorList });
        }

        /*
         * Type : POST
         * URL : /api/account/confirmEmail?
         * Param : formdata
         * Description: test
         * Response Status: 200 Ok, 401 Unauthorized
         */
        [HttpGet("[action]")]
        public async Task<IActionResult> ConfirmEmail(String userID, String token)
        {
            System.Diagnostics.Debug.WriteLine("Verification method called");
            System.Diagnostics.Debug.WriteLine("Token: " + token + "\n" + "UserID: " + userID);
            var user = await _userManager.FindByIdAsync(userID);

            string encodedString="";

            // var decodedTokenString = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));

            if (!await _userManager.IsEmailConfirmedAsync(user))
            {
                System.Diagnostics.Debug.WriteLine("User is NOT verified");
                try{
                await _userManager.ConfirmEmailAsync(user, token);
                System.Diagnostics.Debug.WriteLine("User is verified");
                var emailContent = "<p>You have been successfully registered for the AnalySim website.</p>";
                await _mailNetService.SendEmail(user.Email, user.UserName, "Registration Complete", emailContent, emailContent);
                encodedString = HttpUtility.UrlEncode("true"); 
                return Redirect("~/email-confirmation?result="+encodedString);   

                }
                catch(Exception ex)
                {
                    encodedString = HttpUtility.UrlEncode("Account Confirmation Failed. Please try again later.");
                                    return Redirect("~/email-confirmation?result="+encodedString); 
                }
            }

            // TODO: redirect to error page saying user already verified
            encodedString = HttpUtility.UrlEncode("Account Has Already Been Verified.");
            return Redirect("~/email-confirmation?result="+encodedString);   

            // return
            // return RedirectToPage("/Index");
            // return "test verify token" + ". Token:" + token;
        }

        /* Type : POST
         * URL : /api/account/sendConfirmationEmail
         * Param : formdata
         * Description: Verifies the user from the token sent from Register
         * Response Status: 200 Ok, 401 Unauthorized
         */
        [HttpGet("[action]")]
        public async Task<IActionResult> SendConfirmationEmail([FromQuery(Name = "EmailAddress")] string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            // generate email token
            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var callbackUrl = Url.Action("ConfirmEmail", "Account", new
                {
                    userid = user.Id,
                    token = code,
                }, protocol: HttpContext.Request.Scheme);

            // send verification token
            var emailContent = "Please confirm your account by clicking this link: <a href=\"" + callbackUrl + "\">link</a>";
            await _mailNetService.SendEmail(user.Email, user.UserName, "Confirm your account", emailContent, emailContent);   

                // return View("ForgotPasswordConfirmation");
            //}

            return Ok(new
            {
                result = user,
                message = "Sucessfully sent verification email"
            });  
        }

        /*
         * Type : POST
         * URL : /api/account/forgotPassword
         * Description: Generates reset password token and sends api link through email
         * Response Status: 200 Ok, 400 Bad Request
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> ForgotPassword([FromForm] ForgotPasswordVM formdata)
        {
            // TODO: works but could be more secure
            //if (ModelState.IsValid)
            //{
            var user = await _userManager.FindByEmailAsync(formdata.EmailAddress);
            if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
            {
                // Don't reveal that the user does not exist or is not confirmed
                // return View("ForgotPasswordConfirmation");encode
            }

            var code = await _userManager.GeneratePasswordResetTokenAsync(user);
            System.Diagnostics.Debug.WriteLine(code);
            var callbackUrl = Url.Action("ResetPassword", "Account", 
            new { 
                UserId = user.Id, 
                code = System.Web.HttpUtility.UrlEncode(code)
            }, protocol: HttpContext.Request.Scheme); 

            var emailContent = "Please reset your password by clicking here: <a href=\"" + callbackUrl + "\">link</a>";


            await _mailNetService.SendEmail(user.Email, user.UserName, "Reset Password Link", emailContent, emailContent);

                // return View("ForgotPasswordConfirmation");
            //}

            return Ok(new
            {
                result = user,
                message = "Password Successfully Changed"
            });
        }

        /*
         * Type : GET
         * URL : /api/account/resetPassword?
         * Description: Pass password Token and UserID to Reset password page and redirect
         * Response Status: 200 Ok, 400 Bad Request
         */
        [HttpGet("[action]")]
        public IActionResult ResetPassword(String UserId, String code)
        {
            return Redirect("~/resetPassword?UserId=" + UserId + "&code=" + code);
        }


        /*
         * Type : POST
         * URL : /api/account/sendForgotPasswordEmail
         * Description: 
         * Response Status: 200 Ok, 400 Bad Request
         */
        [HttpPost("[action]")]
        private async Task SendForgotPasswordEmail([FromForm] AccountRegisterVM user, IMailNetService emailService, string token)
        {
            // send verification token
            await emailService.SendEmail(user.EmailAddress, user.Username, "Forgot password", "Verification", token);
        }


        /*
         * Type : POST
         * URL : /api/account/changePassword
         * Description: Based on the form data sent in, this will change the current password to the new one
         * Response Status: 200 Ok, 400 Bad Request
         */
        [HttpPost("[action]")]
        // TODO: JOE FIX, MAKE A NEW VIEW MODEL 
        public async Task<IActionResult> changePassword([FromForm] ChangePasswordVM formdata)
        {
            var user = await _userManager.FindByIdAsync(formdata.userId);
            var resetPassResult =  _userManager.ResetPasswordAsync(user, formdata.passwordToken, formdata.NewPassword);

            return Ok(new
            {
                result = resetPassResult.Result,
                message = "Password Successfully Changed"
            });
        }

        /*
       * Type : Post
       * URL : /api/account/testGenerateToken?
       * Description: Return User(s) from list of id
       * Response Status: 200 Ok, 404 Not Found
       */
        [HttpPost("[action]")]
        public async Task<String> testGenerateToken([FromForm] AccountRegisterVM formdata)
        {
            // Create User Object
            var user = new User
            {
                Email = formdata.EmailAddress,
                UserName = formdata.Username,
                DateCreated = DateTimeOffset.UtcNow,
                LastOnline = DateTimeOffset.UtcNow,
                SecurityStamp = Guid.NewGuid().ToString()
            };


            // generate token
            return await _userManager.GenerateUserTokenAsync(user, "MyApp", "RefreshToken");
        }


        /*
         * Type : POST
         * URL : /api/account/login
         * Param : UserLoginViewModel
         * Description: Login and return Application User, login token, and expiration time
         * Response Status: 200 Ok, 401 Unauthorized
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> Login([FromForm] AccountLoginVM formdata)
        {

            // Get The User
            var user = await _userManager.FindByNameAsync(formdata.Username);

            // Get The User Role
            //var roles = await _userManager.GetRolesAsync(user);

            // Generate Key Token
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtSettings.Secret));

            // Generate Expiration Time For Token
            double tokenExpiryTime = Convert.ToDouble(_jwtSettings.ExpireTime);

            // Check Login Status
            if (user != null && await _userManager.CheckPasswordAsync(user, formdata.Password))
            {
                // todo: link to resend verification email.
                if (!await _userManager.IsEmailConfirmedAsync(user))
                {
                    return Unauthorized(new
                    {
                        LoginError = $"Please verify your account by clicking the link in the email that you received.",
                        EmailConf = user.Email
                    });
                }

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
                        //new Claim(ClaimTypes.Role, roles.FirstOrDefault()),
                        new Claim("LoggedOn", DateTime.UtcNow.ToString())
                    }),

                    SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature),
                    Issuer = _jwtSettings.Issuer,
                    Audience = _jwtSettings.Audience,
                    Expires = DateTime.UtcNow.AddMinutes(tokenExpiryTime)
                };

                // Create Token
                var token = tokenHandler.CreateToken(tokenDescriptor);

                // Update Last Online
                user.LastOnline = DateTime.UtcNow;

                // Save Database Change
                await _dbContext.SaveChangesAsync();

                _dbContext.Entry(user).Collection(u => u.ProjectUsers).Load();
                _dbContext.Entry(user).Collection(u => u.BlobFiles).Load();
                _dbContext.Entry(user).Collection(u => u.Followers).Load();
                _dbContext.Entry(user).Collection(u => u.Following).Load();

                // Return OK Request
                return Ok(new
                {
                    result = user,
                    token = tokenHandler.WriteToken(token),
                    expiration = token.ValidTo,
                    message = "Login successful"
                });

            }
            else
            {

                ModelState.AddModelError("", "Username/Password was not found");

                // Return Unauthorized Status If Unable To Login
                return Unauthorized(new
                {
                    LoginError = "Please check the login credentials - Invalid username/password was entered"
                });
            }
        }



        /*
         * Type : POST
         * URL : /api/account/uploadprofileimage
         * Description: Upload File To Azure Storage
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadProfileImage([FromForm] AccountUploadVM formdata)
        {
            try
            {
                // Reture Bad Request Status
                if (formdata.File == null) return BadRequest("Null File");
                if (formdata.File.Length == 0) return BadRequest("Empty File");

                // Find User
                var user = await _dbContext.Users.FindAsync(formdata.UserID);
                if (user == null) return NotFound(new { message = "User Not Found" });

                //Create File Path With File
                var filePath = user.UserName + "/profileImage" + Path.GetExtension(formdata.File.FileName);

                BlobClient blobClient = await _blobService.UploadFileBlobResizeAsync(formdata.File, "profile", filePath, 250, 250);
                BlobProperties blobProperties = blobClient.GetProperties();

                // Check For Existing
                var blobFile = _dbContext.BlobFiles.FirstOrDefault(x => x.Uri == blobClient.Uri.AbsoluteUri.ToString());
                if (blobFile != null)
                {
                    blobFile.Extension = Path.GetExtension(formdata.File.FileName);
                    blobFile.Size = (int)blobProperties.ContentLength;
                    blobFile.Uri = blobClient.Uri.AbsoluteUri.ToString();
                    blobFile.LastModified = blobProperties.LastModified.LocalDateTime;

                    // Set Entity State
                    _dbContext.Entry(blobFile).State = EntityState.Modified;

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { result = blobFile, message = "Profile Image Updated" });
                }

                // Create BlobFile
                var newBlobFile = new BlobFile
                {
                    Container = "profile",
                    Directory = user.UserName + "/",
                    Name = "profileImage",
                    Extension = Path.GetExtension(formdata.File.FileName),
                    Size = (int)blobProperties.ContentLength,
                    Uri = blobClient.Uri.AbsoluteUri.ToString(),
                    DateCreated = blobProperties.CreatedOn.UtcDateTime,
                    LastModified = blobProperties.LastModified.UtcDateTime,
                    UserID = formdata.UserID
                };

                // Update Database with entry
                await _dbContext.BlobFiles.AddAsync(newBlobFile);
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    result = newBlobFile,
                    message = "File Successfully Uploaded"
                });
            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(new
                {
                    error = e
                });
            }
        }
        #endregion

        #region PUT REQUEST
        /*
        * Type : PUT
        * URL : /api/account/updateuser/
        * Param : {userID}, ProjectViewModel
        * Description: Update Project
        * Response Status: 200 Ok, 404 Not Found
        */
        [HttpPut("[action]/{userID}")]
        public IActionResult UpdateUser([FromRoute] int userID, [FromForm] AccountUpdateVM formdata)
        {
            // Check Model State
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Find User
            var user = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .FirstOrDefault(u => u.Id == userID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Update Bio
            user.Bio = formdata.Bio;

            // Save Change
            _dbContext.SaveChanges();

            // Return Ok Status
            return Ok(new
            {
                result = user,
                message = "User has been updated"
            });

        }
        #endregion

        #region DELETE REQUEST
        /*
         * Type : DELETE
         * URL : /api/account/unfollow/
         * Param : {userID}/{followerID}
         * Description: Have the follower unfollow the user
         * Response Status: 200 Ok, 404 Not Found
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
                message = follower.UserName + " has unfollow " + user.UserName
            });
        }
        #endregion

        #region Extra
        /*
         * Type : GET
         * URL : /api/account/getprojects/
         * Param : {userID}
         * Description: Get list of project user has connection to
         * Response Status: 200 Ok, 204 No Content
         */
        [HttpGet("[action]/{userID}")]
        public IActionResult GetProjects([FromRoute] int userID)
        {
            // Find User
            //var user = _dbContext.Users.SingleOrDefault(x => x.Id == userID);
            //if (user == null) return NotFound(new { message = "User Not Found" });

            var userProjects = _dbContext.ProjectUsers
                .Include(pu => pu.Project)
                    .ThenInclude(p => p.BlobFiles)
                .Include(pu => pu.Project)
                    .ThenInclude(p => p.ProjectUsers)
                .Include(pu => pu.Project)
                    .ThenInclude(p => p.ProjectTags)
                    .ThenInclude(pt => pt.Tag)
                .Where(pu => pu.UserID == userID)
                .AsEnumerable();


            //if (userProjects.Count() == 0) return NoContent();

            // Return Ok Status
            return Ok(new
            {
                result = userProjects,
                message = "Recieved User Project"
            });
        }

        /*
        * Type : GET
        * URL : /api/account/getfollowers/
        * Param : {userID}
        * Description: Get follower from user id
        * Response Status: 200 Ok, 204 No Content, 404 Not Found
        */
        [HttpGet("[action]/{userID}")]
        public IActionResult GetFollowers([FromRoute] int userID)
        {
            // Find User
            var user = _dbContext.Users.SingleOrDefault(x => x.Id == userID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            var userFollowers = _dbContext.UserUsers
                .Include(uu => uu.Follower).ThenInclude(f => f.Followers)
                .Include(uu => uu.Follower).ThenInclude(f => f.Following)
                .Where(u => u.UserID == userID)
                .ToList();

            if (userFollowers.Count() == 0) return NoContent();

            return Ok(new
            {
                result = userFollowers,
                message = "Recieved User Follower"
            });
        }

        /*
        * Type : GET
        * URL : /api/account/getfollowings/
        * Param : {userID}
        * Description: Get user following from user id
        * Response Status: 200 Ok, 204 No Content, 404 Not Found
        */
        [HttpGet("[action]/{userID}")]
        public IActionResult GetFollowings([FromRoute] int userID)
        {
            // Find User
            var user = _dbContext.Users
                .Include(u => u.Following)
                .Include(u => u.Followers)
                .SingleOrDefault(x => x.Id == userID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            var userFollowings = _dbContext.UserUsers
                .Include(uu => uu.User).ThenInclude(f => f.Followers)
                .Include(uu => uu.User).ThenInclude(f => f.Following)
                .Where(u => u.FollowerID == userID)
                .ToList();
            if (userFollowings.Count() == 0) return NoContent();

            return Ok(new
            {
                result = userFollowings,
                message = "Recieved User Following"
            });
        }

        /*
         * Type : DELETE
         * URL : /api/account/deleteprofileimage/
         * Param : {fileID}
         * Description: Delete File From Azure Storage
         */
        [HttpDelete("[action]/{fileID}")]
        public async Task<IActionResult> DeleteProfileImage([FromRoute] int fileID)
        {
            try
            {
                // Find File
                var blobFile = await _dbContext.BlobFiles.FindAsync(fileID);
                if (blobFile == null) return NotFound(new { message = "File Not Found" });

                await _blobService.DeleteBlobAsync(blobFile);

                // Delete Blob Files From Database
                _dbContext.BlobFiles.Remove(blobFile);

                // Save Change to Database
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    result = blobFile,
                    message = "File Successfully Deleted"
                });
            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(new
                {
                    error = e
                });
            }

        }
        #endregion
    }

}
