# -*- coding: utf-8 -*-
"""
Created on Thu Dec  6 11:08:44 2018

@author: Michael Cox
"""
import sys
import json
from simple_report import SimpleReport
from THIG import odbc
from MySQLdb import ProgrammingError

report = json.loads(sys.argv[1])
report_filename = sys.argv[2] + '.xlsx'

try:
    sr = SimpleReport(**report)
    for sheet in report['sheets']:
        sr.add_sheet(**sheet)
        for table in sheet['tables']:
            try:
                table['dataframe'] = odbc.query_data(table['database'],
                                                     table['query'])
            except ProgrammingError as e:
                print(e)
            sr.sheets[sheet['name']].add_table(**table)

    sr.save('tmp/' + report_filename)
except Exception as e:
    print(e)

#sys.stdout.flush()
