from django.apps import AppConfig


class RideMgmtConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ride_mgmt'
    def ready(self) -> None:
        
        return super().ready()
