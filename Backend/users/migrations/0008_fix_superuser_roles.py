from django.db import migrations

def fix_superuser_roles(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(is_superuser=True, role='student').update(role='admin', is_staff=True)

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_user_selected_career'),
    ]

    operations = [
        migrations.RunPython(fix_superuser_roles, migrations.RunPython.noop),
    ]