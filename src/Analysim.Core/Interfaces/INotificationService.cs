using System.Threading.Tasks;
using Core.Models;

namespace Core.Interfaces
{
    public interface INotificationService
    {
        Task PublishAsync(NotificationEvent notificationEvent);
    }
}
