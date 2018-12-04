# -*- coding: utf-8 -*-
"""
Created on Thu Nov  8 10:58:16 2018

@author: Michael Cox
"""

# TODO send an email to the creator (and maybe BI) if the report fails

import pymongo
from simple_report import SimpleReport
from THIG import odbc # this is a custom module I made to query out databases
from bson import Binary
import datetime
import platform
import os
from dateutil import tz
from dotenv import load_dotenv

root = os.path.dirname(__file__) + '/' # relative directory path

now = datetime.datetime.now()
print('\n\nStarting ' + now.strftime('%Y-%m-%d %H:%M:%S'))

load_dotenv(dotenv_path=root + '.env')
env = os.getenv('NODE_ENV')
print('Environment: ' + env)

if platform.system() == 'Windows':
    zero = '#'
    from pyodbc import ProgrammingError
    mongodb_ip = os.getenv('WIN_IP')
elif platform.system() == 'Linux':
    zero = '-'
    from MySQLdb import ProgrammingError
    mongodb_ip = os.getenv('LINUX_IP')

path = root + 'dist/'
# Load HTML email notification template
print('\tLoad HTML email templates')
with open(path + 'daily_delivery.html', 'r') as my_file:
    email_template = my_file.read()
with open(path + 'immediate_notification.html', 'r') as my_file:
    email_notification_template = my_file.read()
with open(path + 'report_row.html', 'r') as my_file:
    row_template = my_file.read()
path = root + 'tmp/'

# for converting to local time zone
from_zone = tz.tzutc()
to_zone = tz.tzlocal()

time = ''
time = 'Midnight' if now.hour < 4 else time
time = 'Morning' if 4 <= now.hour < 12 else time
time = 'Afternoon' if 12 <= now.hour < 16 else time
time = 'Evening' if 16 <= now.hour < 22 else time
time = 'Night' if 22 <= now.hour else time

print('Time: ' + time)
########## Setup Client

client = pymongo.MongoClient("mongodb://" + os.getenv('DB_USER') +
                             ":" + os.getenv('DB_PASSWORD') +
                             "@" + mongodb_ip)
if env == 'production':
    db = client.simpleReport
else:
    db = client.test

########## Query Reports
print('Querying reports to run')
query = [
    { '$unwind': {
        'path': '$schedules'
    }},
    { '$match': {
        '$and': [
            { 'schedules.time': time },
            { '$or': [
                    { 'schedules.freq': 'daily'},
                    { '$and': [
                            { 'schedules.freq': 'weekly' },
                            { 'schedules.weekday': now.strftime("%A") }
                    ]},
                    { '$and': [
                            { 'schedules.freq': 'monthly' },
                            { 'schedules.day': now.day }
                    ]},
                    { '$and': [
                            { 'schedules.freq': 'yearly' },
                            { 'schedules.month': now.strftime('%B')},
                            { 'schedules.day': now.day }
                    ]}
            ]}
        ]
    }},
    { '$group': {
        '_id': {
            '_id': '$_id',
            'name': '$name',
            'description': '$description',
            'print_report_name_on_every_sheet':
                '$print_report_name_on_every_sheet',
            'print_sheet_name': '$print_sheet_name',
            'sheets': '$sheets',
            'permissions': '$permissions'
        }
    }},
    { '$addFields': {
        '_id': '$_id._id',
        'name': '$_id.name',
        'description': '$_id.description',
        'print_report_name_on_every_sheet':
            '$_id.print_report_name_on_every_sheet',
        'print_sheet_name': '$_id.print_sheet_name',
        'sheets': '$_id.sheets',
        'permissions': '$_id.permissions'
    }},
    { '$sort': {
            'name': 1
    }},
    { '$lookup': {
        'from': 'users',
        'let': { 'report_id': '$_id' },
        'pipeline': [
            { '$match': {
                '$expr': {
                    '$in': [ '$$report_id', '$subscriptions' ]
                }
            }}
        ],
        'as': 'subscribed'
    }},
    { '$lookup': {
        'from': 'users',
        'let': { 'report_id': '$_id' },
        'pipeline': [
            { '$match': {
                '$expr': {
                    '$in': [ '$$report_id', '$notifications' ]
                }
            }}
        ],
        'as': 'notify'
    }},
    { '$addFields': {
        'subscribed': '$subscribed._id',
        'notify': '$notify._id',
        'starred': '$starred._id'
    }}
]

reports_cursor = db.definitions.aggregate(query)

reports = []

for report in reports_cursor:
    print('\t' + report['name'])
    reports.append(report)

########## Query for Users
print('Querying users')
query = [
    { '$match': {
        '$expr': {
            '$or': [
                { '$gte': [ { '$size': '$subscriptions' }, 1 ] },
                { '$gte': [ { '$size': '$notifications' }, 1 ] }
            ]
        }
    }}
]

users_cursor = db.users.aggregate(query)

users = []
for user in users_cursor:
    print('\t' + user['username'])
    users.append(user)

########## Generate Reports
print('Generating Reports')

for report in reports:
    print('\t' + report['name'])
    # Create and Save the report with SimpleReport
    report_filename = report['name'] + '.xlsx'

    sr = SimpleReport(**report)
    for sheet in report['sheets']:
        sr.add_sheet(**sheet)
        for table in sheet['tables']:
            print(f'\t\tQuerying database for table "{table["name"]}" ' +
                  f'in sheet "{sheet["name"]}"')
            try:
                table['dataframe'] = odbc.query_data(table['database'],
                                                     table['query'])
            except ProgrammingError:
                print('\n####################')
                print('Error with query')
                print('\n####################\n')
            sr.sheets[sheet['name']].add_table(**table)
    print('\t\tGenerating report')
    sr.save(path + report_filename)

    # Read the file as binary
    print('\t\tReading binary')
    with open(path + report_filename, 'rb') as my_file:
        file_binary = my_file.read()

    # Save the file to the database
    print('\t\tInserting binary')
    inserted = db.reports.insert_one({'definition_id': report['_id'],
                                      'filename': report_filename,
                                      'file': Binary(file_binary),
                                      'downloads': []})

    report['inserted_id'] = inserted.inserted_id
    report['created'] = inserted.inserted_id.generation_time
    report['created'] = report['created'].replace(tzinfo=from_zone)
    report['created'] = report['created'].astimezone(to_zone)

    # Update users' undelivered reports
    print('\t\tFind subscribbed users')
    users_to_update = []
    for user in users:
        if report['_id'] in user['subscriptions']:
            print('\t\t\t' + user['username'])
            users_to_update.append(user['_id'])

    print('\t\tUpdating users')
    if len(users_to_update):
        db.users.update_many({ '_id': { '$in': users_to_update } },
                             { '$addToSet': { 'undelivered': report['_id']}},
                             upsert=True)

    # Email immediate notifications
    print('\t\tSending immediate notifications')
    for user in users:
        if report['_id'] in user['notifications']:

            report['created'] = inserted.inserted_id.generation_time
            report['created'] = report['created'].replace(tzinfo=from_zone)
            report['created'] = report['created'].astimezone(to_zone)

            html_row = row_template.format(
                    report_name=report['name'],
                    report_id=report['inserted_id'],
                    definition_id=report['_id'],
                    created=report['created'].strftime(f'%x at %{zero}I:%M %p'))

            print('\t\t\tSave HTML email notification')
            email_filename = str(user['_id']) + '.html'
            with open(path + email_filename, 'w') as my_file:
                my_file.write(email_notification_template.format(rows=html_row))

            print('\t\t\tSend email notification')
            linux_cmd = 'mail -a "Content-type: text/html" '
            if env == 'production':
                linux_cmd += f"""-s "Report notification: {report['name']}" """
            else:
                linux_cmd += f"""-s "Report notification: {report['name']} """
                linux_cmd += f"""({user['username']})" """
            # from
            linux_cmd += f""" -r simplereport@{os.getenv('DOMAIN')} """
            # to
            if env == 'production':
                linux_cmd += f""" {user['username']}@{os.getenv('DOMAIN')} """
            else:
                linux_cmd += f""" {os.getenv('ADMIN')}@{os.getenv('DOMAIN')} """
            # html_file
            linux_cmd += f'< {os.getenv("LINUX_PATH")}tmp/' + email_filename

            print(linux_cmd)

            if platform.system() == 'Linux':
                os.system(linux_cmd)

########## Send delivery emails

#if time == 'Morning' or env != 'production':
if time == 'Morning':
    print('Sending delivery emails')

    # Get users
    print('\tGet users with undelivered reports')
    query = [
        { '$match': {
            '$expr': {
                '$gte': [ { '$size': { '$ifNull': [ '$undelivered', [] ] } },
                         1 ]
            }
        }}
    ]

    users_cursor = db.users.aggregate(query)

    users = []
    for user in users_cursor:
        print('\t\t' + user['username'])
        users.append(user)

    if not len(users):
        print('\tNo undelivered reports to send')

    print('\tSend emails')
    for user in users:
        print('\t\t' + user['username'])

        query = [
                    { '$match': {
                        '_id': { '$in': user['undelivered'] }
                    }},
                    { '$project': { 'name': 1 } },
                    { '$lookup': {
                            'from': 'reports',
                            'localField': '_id',
                            'foreignField': 'definition_id',
                            'as': 'report_id'
                    }},
                    { '$addFields': {
                        'report_id': { '$max': '$report_id._id' }
                    }},
                    { '$addFields': {
                            'created': { '$toDate': '$report_id' }
                    }}
                ]

        undelivereds_cursor = db.definitions.aggregate(query)

        undelivereds = []
        for undelivered in undelivereds_cursor:
            undelivereds.append(undelivered)
        print('\t\t\tCompile reports')
        html_row = ''
        for undelivered in undelivereds:
            print('\t\t\t\t' + undelivered['name'])

            undelivered['created'] = undelivered['created'].replace(
                tzinfo=from_zone)
            undelivered['created'] = undelivered['created'].astimezone(to_zone)

            html_row += row_template.format(
                report_name=undelivered['name'],
                report_id=undelivered['report_id'],
                definition_id=undelivered['_id'],
                created=undelivered['created'].strftime(f'%x at %{zero}I:%M %p')
            )

        print('\t\t\tRemove undelivered in database')
        query = { '_id': user['_id'] }
        update = { '$set': { 'undelivered': [] } }
        db.users.find_one_and_update(query, update, upsert=True)


        print('\t\t\tSave HTML email')
        email_filename = str(user['_id']) + '.html'
        with open(path + email_filename, 'w') as my_file:
            my_file.write(email_template.format(
                    rows=html_row,
                    name_of_user=user['ldap']['givenName']
            ))

        print('\t\t\tSend email')
        linux_cmd = """mail -a "Content-type: text/html" """
        if env == 'production':
            linux_cmd += """-s "Daily Report Delivery" """
        else:
            linux_cmd += f"""-s "Daily Report Delivery ({user['username']})" """
        # from
        linux_cmd += f' -r simplereport@{os.getenv("DOMAIN")} '
        # to
        if env == 'production':
            linux_cmd += f""" {user['username']}@{os.getenv('DOMAIN')} """
        else:
            linux_cmd += f""" {os.getenv('ADMIN')}@{os.getenv('DOMAIN')} """
        # html_file
        linux_cmd += f'< {os.getenv("LINUX_PATH")}tmp/' + email_filename

        print(linux_cmd)

        if platform.system() == 'Linux':
            os.system(linux_cmd)
