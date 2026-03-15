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
using Microsoft.AspNetCore.WebUtilities;
using System.Data;
using Analysim.Core.Entities;
using Microsoft.AspNetCore.Authorization;

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
        private readonly ILoggerManager _loggerManager;
        private readonly IMailNetService _mailNetService;
        private readonly FileValidationSettings _fileValidationSettings;

        private readonly IConfiguration _configuration;

        public AccountController(IOptions<JwtSettings> jwtSettings, UserManager<User> userManager,
            SignInManager<User> signManager, ApplicationDbContext dbContext,
                                 ILoggerManager loggerManager,
                                 IMailNetService mailNetService,IConfiguration configuration,
                                 IOptions<FileValidationSettings> fileValidationSettings)
        {
            _jwtSettings = jwtSettings.Value;
            _userManager = userManager;
            _signManager = signManager;
            _dbContext = dbContext;
            _fileValidationSettings = fileValidationSettings.Value;
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
                result = ViewModels.Account.UserSafeDTO.FromUser(user),
                message = "Received User: " + user.UserName
            });
        }

        /*
        * Type : GET
        * URL : /api/account/isadmin/
        * Description: check the user is admin or not
        * Response Status: 200 Ok, 404 Not Found
        */
        [HttpGet("[action]/{username}")]
        public IActionResult IsAdmin([FromRoute] string username)
        {
            var user = _dbContext.Users
                .SingleOrDefault(u => u.UserName == username);
            if (user == null) return NotFound(new { message = "User Not Found" });

            var admins = _configuration
                .GetSection("AdminUsers")
                .Get<List<string>>() ?? new List<string>();

            bool isAdmin = admins
                .Any(u => string.Equals(u, user.UserName, StringComparison.OrdinalIgnoreCase));

            return Ok(new { result = isAdmin });
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
                result = ViewModels.Account.UserSafeDTO.FromUser(user),
                message = "Received User: " + user.UserName
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
                result = ViewModels.Account.UserSafeDTO.FromUsers(users),
                message = "Received User Range"
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
                result = ViewModels.Account.UserSafeDTO.FromUsers(users),
                message = "Received User List"
            });
        }

        /*
         * Type : GET
         * URL : /api/account/getprofileimage?
         * Description: Return blob file from user id
         * Response Status: 200 Ok
         */
        [HttpGet("[action]")]
        public IActionResult GetProfileImage([FromQuery(Name="id")] int id)
        {
            var blobfile = _dbContext.BlobFiles
                .Where(b => b.UserID == id && b.Name == "profileImage")
                .FirstOrDefault();
            if (blobfile == null) return NotFound(new { message = "Profile Image Not Found"});

            //blobfile.content = null;

            return Ok(new
            {
                result = blobfile,
                message = "Received user's profile picture"
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
                result = ViewModels.Account.UserSafeDTO.FromUsers(matchedUser.ToList()),
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
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> Follow([FromForm] AccountFollowVM formdata)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "Current user not found" });

            // Find User to follow
            var userToFollow = await _dbContext.Users.FindAsync(formdata.UserID);
            if (userToFollow == null) return NotFound(new { message = "User to follow not Found" });

            // Create Many To Many Connection
            var userFollower = new UserUser
            {
                UserID = userToFollow.Id,
                FollowerID = user.Id
            };

            // Add To Database
            await _dbContext.UserUsers.AddAsync(userFollower);

            // Save Change
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                result = userFollower,
                message = user.UserName + " is now following " + userToFollow.UserName
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
                code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

                var callbackUrl = $"{Request.Scheme}://{Request.Host}/email-confirmation?userid={Uri.EscapeDataString(user.Id.ToString())}&token={Uri.EscapeDataString(code)}";

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
         * Type : GET
         * URL : /api/account/confirmEmail?userID={userID}&token={token}
         * Param :
         *   - userID: The ID of the user being confirmed
         *   - token: The email confirmation token
         * Description: Redirects users to new confirmation page. 
         *              Exists for backwards compatibility with prior email links.
         * Response Status: 302 Redirect
         */
        [HttpGet("[action]")]
        public IActionResult ConfirmEmail(string userID, string token)
        {
            var redirectUrl =
                $"~/email-confirmation?userid={Uri.EscapeDataString(userID)}&token={Uri.EscapeDataString(token)}";

            return Redirect(redirectUrl);
        }

        /*
         * Type : POST
         * URL : /api/account/ConfirmEmailPost?userID={userID}&token={token}
         * Param :
         *   - userID: The ID of the user being confirmed
         *   - token: The email confirmation token
         * Description: Confirms a user's email address using the provided confirmation token
         * Response Status:
         *   200 OK
         *     - Email successfully verified
         *     - Email already verified
         *   400 BadRequest
         *     - Invalid confirmation link
         *     - Token validation failed
         *   401 Unauthorized
         *     - User does not exist
         *   500 InternalServerError
         *     - Unexpected server error during confirmation
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> ConfirmEmailPost(String userID, String token)
        {
            if (string.IsNullOrWhiteSpace(userID) || userID.Equals("null", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { success = false, message = "Invalid confirmation link." });

            if (!int.TryParse(userID, out _))
                return BadRequest(new { success = false, message = "Invalid confirmation link." });

            if (string.IsNullOrWhiteSpace(token) || token.Equals("null", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { success = false, message = "Invalid confirmation link." });


            var user = await _userManager.FindByIdAsync(userID);

            if (user == null) return Unauthorized("This email address has not been registered yet");

            // Already confirmed
            if (await _userManager.IsEmailConfirmedAsync(user))
            {
                return Ok(new
                {
                    success = true,
                    message = "Account has already been verified."
                });
            }

            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

                if (result.Succeeded)
                {
                    var emailContent = "<p>You have been successfully registered for the AnalySim website.</p>";

                    await _mailNetService.SendEmail(
                        user.Email,
                        user.UserName,
                        "Registration Complete",
                        emailContent,
                        emailContent
                    );

                    return Ok(new
                    {
                        success = true,
                        message = "Email successfully verified."
                    });
                }

                return BadRequest(new
                {
                    success = false,
                    message = "Account confirmation failed.",
                    errors = result.Errors
                });
            }
            catch (Exception ex)
            {
                Console.Write(ex.ToString());

                return StatusCode(500, new
                {
                    success = false,
                    message = "Account confirmation failed. Please try again later."
                });
            }
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
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

            var callbackUrl = $"{Request.Scheme}://{Request.Host}/email-confirmation?userid={Uri.EscapeDataString(user.Id.ToString())}&token={Uri.EscapeDataString(code)}";

            // send verification token
            var emailContent = "Please confirm your account by clicking this link: <a href=\"" + callbackUrl + "\">link</a>";
            await _mailNetService.SendEmail(user.Email, user.UserName, "Confirm your account", emailContent, emailContent);   

                // return View("ForgotPasswordConfirmation");
            //}

            return Ok(new
            {
                result = user,
                message = "Successfully sent verification email"
            });  
        }

        /*
         * Type : POST
         * URL : /api/account/forgotPassword
         * Description: Generates reset password token and sends api link through email
         * Response Status: 200 Ok, 400 Bad Request, 401 Unauthorized
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> ForgotPassword([FromForm] ForgotPasswordVM formdata)
        {
            // TODO: works but could be more secure
            //if (ModelState.IsValid)
            //{
            var user = await _userManager.FindByEmailAsync(formdata.EmailAddress);
            //if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
            //{
            // Don't reveal that the user does not exist or is not confirmed
            // return View("ForgotPasswordConfirmation");encode
            //}
            if (user == null) return Unauthorized("This email address has not been registered yet");
            if (!(await _userManager.IsEmailConfirmedAsync(user))) return BadRequest("PLease confirm your email address first");


            var code = await _userManager.GeneratePasswordResetTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

            System.Diagnostics.Debug.WriteLine(code);
            var callbackUrl = Url.Action("ResetPassword", "Account", 
            new { 
                UserId = user.Id,
                code
        }, protocol: HttpContext.Request.Scheme); 

            var emailContent = "Please reset your password by clicking here: <a href=\"" + callbackUrl + "\">link</a>";


            await _mailNetService.SendEmail(user.Email, user.UserName, "Reset Password Link", emailContent, emailContent);

                // return View("ForgotPasswordConfirmation");
            //}

            return Ok(new
            {
                result = user,
                message = "Password Reset mail sent"
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
            var decodedTokenBytes = WebEncoders.Base64UrlDecode(formdata.passwordToken);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

            var resetPassResult =  _userManager.ResetPasswordAsync(user, decodedToken, formdata.NewPassword);

            if(resetPassResult.Result.Succeeded)
            {
                return Ok(new
                {
                    result = resetPassResult.Result,
                    message = "Password Successfully Changed"
                });
            }

            return BadRequest(new
            {
                result = resetPassResult.Result,
                message = "Password Change failed"
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
            var username = await _userManager.FindByNameAsync(formdata.Username);
            var email = await _userManager.FindByEmailAsync(formdata.Username);

            // Get The User Role
            //var roles = await _userManager.GetRolesAsync(user);

            // Generate Key Token
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtSettings.Secret));

            // Generate Expiration Time For Token
            double tokenExpiryTime = Convert.ToDouble(_jwtSettings.ExpireTime);

            // Check Login Status
            if ((username != null && await _userManager.CheckPasswordAsync(username, formdata.Password)) || (email != null && await _userManager.CheckPasswordAsync(email, formdata.Password)))
            {
                var user = username;
                if (email != null){
                    user = email;
                }
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
                        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                        //new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        //new Claim(ClaimTypes.Role, roles.FirstOrDefault()),
                        new Claim("LoggedOn", DateTime.UtcNow.ToString()),
                        new Claim(ClaimTypes.Name, formdata.Username)
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
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadProfileImage([FromForm] AccountUploadVM formdata)
        {
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                // Return Bad Request Status
                if (formdata.File == null) return BadRequest("Null File");
                if (formdata.File.Length == 0) return BadRequest("Empty File");

                // Find User
                //var user = await _dbContext.Users.FindAsync(formdata.UserID);
                //if (user == null) return NotFound(new { message = "User Not Found" });

                //Create File Path With File
                //var filePath = user.UserName + "/profileImage" + Path.GetExtension(formdata.File.FileName);

                //BlobClient blobClient = await _blobService.UploadFileBlobResizeAsync(formdata.File, "profile", filePath, 250, 250);
                //BlobProperties blobProperties = blobClient.GetProperties();

                //byte[] imageBytes;
                //using (var memoryStream = new MemoryStream())
                //{
                //    await formdata.File.CopyToAsync(memoryStream);
                //    imageBytes = memoryStream.ToArray();
                //}
                using var memoryStream = new MemoryStream();
                await formdata.File.CopyToAsync(memoryStream);
                var fileContent = memoryStream.ToArray();

                // Validate file type and size for profile image
                var fileValidator = new Core.Helper.FileTypeValidator(_fileValidationSettings);
                var validationResult = fileValidator.ValidateProfileImage(formdata.File.FileName, fileContent);
                if (!validationResult.IsValid)
                    return BadRequest(validationResult.ErrorMessage);

                // Check For Existing
                var blobFile = _dbContext.BlobFiles.FirstOrDefault(x => x.UserID == user.Id && x.Name == "profileImage");
                if (blobFile != null)
                {
                    blobFile.Extension = Path.GetExtension(formdata.File.FileName);
                    blobFile.Size = (int)formdata.File.Length;
                    blobFile.LastModified = DateTime.UtcNow;
                    //blobFile.content = fileContent;

                    var blobFileContent = _dbContext.BlobFileContent.FirstOrDefault(x => x.BlobFileID == blobFile.BlobFileID);
                    blobFileContent.Content = fileContent;

                    // Set Entity State
                    _dbContext.Entry(blobFile).State = EntityState.Modified;
                    _dbContext.Entry(blobFileContent).State = EntityState.Modified;

                    await _dbContext.SaveChangesAsync();

                    blobFile.BlobFileContents = null;

                    return Ok(new { 
                        result = blobFile, 
                        message = "Profile Image Updated" });
                }

                // Create BlobFile
                var newBlobFile = new BlobFile
                {
                    Container = "profile",
                    Directory = user.UserName + "/",
                    Name = "profileImage",
                    Extension = Path.GetExtension(formdata.File.FileName),
                    Size = (int)formdata.File.Length,
                    Uri = "",
                    //content = fileContent,
                    DateCreated = DateTime.UtcNow,
                    LastModified = DateTime.UtcNow,
                    UserID = user.Id
                };

                // Update Database with entry
                await _dbContext.BlobFiles.AddAsync(newBlobFile);
                await _dbContext.SaveChangesAsync();

                // Create BlobFileContent
                var newBlobFileContent = new BlobFileContent
                {
                    BlobFileID = newBlobFile.BlobFileID,
                    Content = fileContent,
                    DateCreated = DateTime.UtcNow
                };

                // Update Database with entry
                await _dbContext.BlobFileContent.AddAsync(newBlobFileContent);
                await _dbContext.SaveChangesAsync();

                newBlobFile.BlobFileContents = null;

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
        [Authorize]
        [HttpPut("[action]/{userID}")]
        public async Task<IActionResult> UpdateUser([FromRoute] int userID, [FromForm] AccountUpdateVM formdata)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Check Model State
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Find User
            var newuser = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .FirstOrDefault(u => u.Id == user.Id);
            if (newuser == null) return NotFound(new { message = "User Not Found" });

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
        [Authorize]
        [HttpDelete("[action]/{userID}/{followerID}")]
        public async Task<IActionResult> Unfollow([FromRoute] int userID, [FromRoute] int followerID)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "Current user not found" });

            // Find UsertoFollow
            var userToFollow = await _dbContext.Users.FindAsync(userID);
            if (userToFollow == null) return NotFound(new { message = "User to follow not found" });

            // Find Many To Many
            var userFollower = await _dbContext.UserUsers.FindAsync(userToFollow.Id, user.Id);
            if (userFollower == null) return NotFound(new { message = "User Follower Connection Not FOund" });

            // Remove Project
            _dbContext.UserUsers.Remove(userFollower);

            // Save Change
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                result = userFollower,
                message = user.UserName + " has unfollow " + userToFollow.UserName
            });
        }

        /*
         * Type : DELETE
         * URL : /api/account/deleteuser/
         * Param : {userID}
         * Description: Delete the user and its associated entities
         * Response Status: 200 Ok, 404 Not Found
         */
        [Authorize]
        [HttpDelete("[action]/{userId:int}")]
        public async Task<IActionResult> DeleteUser([FromRoute] int userId)
        {
            // Only the same user or an admin may delete the user
            var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(currentUserIdStr, out var currentUserId))
                return Unauthorized(new { message = "Invalid user identity." });

            var currentUsername = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.Name);

            var admins = _configuration
                .GetSection("AdminUsers")
                .Get<List<string>>() ?? new List<string>();

            bool isAdmin = admins
                .Any(u => string.Equals(u, currentUsername, StringComparison.OrdinalIgnoreCase));

            var isSelf = currentUserId == userId;
            if (!isAdmin && !isSelf)
                return Forbid();

            var user = await _dbContext.Users
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)       
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { message = "User not found." });

            using var tx = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                // Delete projects the user owns (this cascades to notebooks, notebook contents, blobfiles, etc.)
                var projectsOwned = await _dbContext.Projects
                    .Include(p => p.ProjectUsers)
                    .Where(p => p.ProjectUsers.Any(pu => pu.UserID == userId && pu.UserRole == "owner"))
                    .ToListAsync();

                _dbContext.Projects.RemoveRange(projectsOwned);
                await _dbContext.SaveChangesAsync(); 

                // Remove memberships from projects the user does not own
                var memberships = await _dbContext.ProjectUsers
                    .Where(pu => pu.UserID == userId)
                    .ToListAsync();
                _dbContext.ProjectUsers.RemoveRange(memberships);
                await _dbContext.SaveChangesAsync();

                // Remove followers/following
                var followerEdges = await _dbContext.UserUsers
                    .Where(uu => uu.UserID == userId || uu.FollowerID == userId)
                    .ToListAsync();
                _dbContext.UserUsers.RemoveRange(followerEdges);
                await _dbContext.SaveChangesAsync();

                // Remove profile images.
                var userOnlyBlobs = await _dbContext.BlobFiles
                    .Where(b => b.UserID == userId && (b.Container == "profile" || b.ProjectID == null))
                    .ToListAsync();
                _dbContext.BlobFiles.RemoveRange(userOnlyBlobs);
                await _dbContext.SaveChangesAsync();

                // Remove the user
                _dbContext.Users.Remove(user);
                await _dbContext.SaveChangesAsync();

                await tx.CommitAsync();

                return Ok(new { message = "User and associated data deleted successfully." });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return BadRequest(new { message = "Failed to delete user.", error = ex.Message });
            }
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
                message = "Received User Project"
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
                message = "Received User Follower"
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
                message = "Received User Following"
            });
        }

        /*
         * Type : DELETE
         * URL : /api/account/deleteprofileimage/
         * Param : {fileID}
         * Description: Delete File From Azure Storage
         */
        [Authorize]
        [HttpDelete("[action]/{fileID}")]
        public async Task<IActionResult> DeleteProfileImage([FromRoute] int fileID)
        {
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                // Find File
                var blobFile = await _dbContext.BlobFiles.FindAsync(fileID);
                if (blobFile == null) return NotFound(new { message = "File Not Found" });

                //await _blobService.DeleteBlobAsync(blobFile);

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
