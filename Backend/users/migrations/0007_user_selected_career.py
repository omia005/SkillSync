from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_user_graduationyear_user_major_user_university_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='selected_career',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]