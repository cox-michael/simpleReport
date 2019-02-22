module.exports = function() {
  const getReports = app => {
    return new Promise(resolve => {
      console.log('\tGet report definitions that need to be run');

        const query = [{
            '$unwind': {
              'path': '$schedules'
            }
          },
          {
            '$match': {
              '$and': [{
                  'schedules.time': app.time
                },
                {
                  '$or': [{
                      'schedules.freq': 'daily'
                    },
                    {
                      '$and': [{
                          'schedules.freq': 'weekly'
                        },
                        {
                          'schedules.weekday': app.now.toLocaleDateString([], {
                            weekday: 'long'
                          })
                        }
                      ]
                    },
                    {
                      '$and': [{
                          'schedules.freq': 'monthly'
                        },
                        {
                          'schedules.day': app.now.getDate()
                        }
                      ]
                    },
                    {
                      '$and': [{
                          'schedules.freq': 'yearly'
                        },
                        {
                          'schedules.month': app.now.toLocaleDateString([], {
                            month: 'long'
                          })
                        },
                        {
                          'schedules.day': app.now.getDate()
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          },
          {
            '$group': {
              '_id': {
                '_id': '$_id',
                'name': '$name',
                'description': '$description',
                'print_report_name_on_every_sheet': '$print_report_name_on_every_sheet',
                'print_sheet_name': '$print_sheet_name',
                'sheets': '$sheets',
                'permissions': '$permissions'
              }
            }
          },
          {
            '$addFields': {
              '_id': '$_id._id',
              'name': '$_id.name',
              'description': '$_id.description',
              'print_report_name_on_every_sheet': '$_id.print_report_name_on_every_sheet',
              'print_sheet_name': '$_id.print_sheet_name',
              'sheets': '$_id.sheets',
              'permissions': '$_id.permissions'
            }
          },
          {
            '$sort': {
              'name': 1
            }
          },
          {
            '$lookup': {
              'from': 'users',
              'let': {
                'report_id': '$_id'
              },
              'pipeline': [{
                '$match': {
                  '$expr': {
                    '$in': ['$$report_id', '$subscriptions']
                  }
                }
              }],
              'as': 'subscribed'
            }
          },
          {
            '$lookup': {
              'from': 'users',
              'let': {
                'report_id': '$_id'
              },
              'pipeline': [{
                '$match': {
                  '$expr': {
                    '$in': ['$$report_id', '$notifications']
                  }
                }
              }],
              'as': 'notify'
            }
          },
          {
            '$addFields': {
              'subscribed': '$subscribed._id',
              'notify': '$notify._id',
              'starred': '$starred._id'
            }
          }
        ];

        // get definitions
        app.dbo.collection('definitions')
          .aggregate(query)
          .toArray((err, docs) => {
            app.definitions = docs;
            console.log('\tDefinitions retrieved:', docs.map(doc => doc.name));
            resolve();
          });

    });
  };

  return getReports;
};
