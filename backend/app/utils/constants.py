import enum

class RideStatus(enum.Enum):
    SCHEDULED = "scheduled"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(enum.Enum):
    REFUNDED = "refunded"
    SUCCESS = "successfull"