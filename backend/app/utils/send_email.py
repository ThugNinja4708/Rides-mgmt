from flask_mail import Message, Mail

class SendMail:
    mail = None

    @staticmethod
    def initialize(app):
        if SendMail.mail is None:
            SendMail.mail = Mail(app)

    @staticmethod
    def send_email(recipients: list, ride):
        message = Message(sender="rithvikkantha3771@gmail.com", subject="Your ride has been cancelled", recipients=recipients)
        pick_up_location = ride.pickup_location["location"]
        drop_location = ride.drop_location["location"]
        message.html = f"<H1>Your ride FROM: {pick_up_location} TO: {drop_location} has been cancelled \
        which has been scheduled on: {ride.start_time}\
        <H1/>"
        SendMail.mail.send(message)
