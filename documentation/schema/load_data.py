
"""
Data Loading Script for ETL
Converts Excel data to PostgreSQL staging table
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import sys
from datetime import datetime, time
import re

#Clean column names to match (OG) schema
def clean_column_name(col):
    if pd.isna(col):
        return 'unnamed_column'
    
    col_str = str(col).strip()
    if not col_str or col_str == '':
        return 'unnamed_column'
    
    clean = re.sub(r'[^a-zA-Z0-9_\s]', '', col_str)
    clean = clean.lower().replace(' ', '_')

    if not clean or clean == '':
        return 'unnamed_column'
    
    return clean

#Parse Excel date to Python date
def parse_date(date_str):
    if pd.isna(date_str) or date_str == '':
        return None
    
    try:
        if isinstance(date_str, str):
            for fmt in ['%d/%m/%Y', '%Y-%m-%d', '%m/%d/%Y']:
                try:
                    return datetime.strptime(date_str, fmt).date()
                except ValueError:
                    continue
        return pd.to_datetime(date_str).date()
    except:
        return None

#Parse time string to Python time
def parse_time(time_str):
    if pd.isna(time_str) or time_str == '':
        return None
    
    try:
        if isinstance(time_str, str):
            for fmt in ['%H:%M', '%H:%M:%S', '%I:%M %p']:
                try:
                    return datetime.strptime(time_str, fmt).time()
                except ValueError:
                    continue
        return pd.to_datetime(time_str).time()
    except:
        return None

#Clean numeric values
def clean_numeric(value):
    if pd.isna(value) or value == '':
        return None
    
    if isinstance(value, str):
        clean = re.sub(r'[^\d.]', '', value)
        if clean:
            try:
                return float(clean)
            except ValueError:
                return None
    return value

#Load excel data into staging table
def load_excel_to_staging(excel_file, db_config):    
    print(f"Loading data from {excel_file}...")
    
    try:
        #Read Excel
        df = pd.read_excel(excel_file, engine='openpyxl')
        print(f"Loaded {len(df)} rows with {len(df.columns)} columns")
        
        #Clean column names
        df.columns = [clean_column_name(col) for col in df.columns]
        print("Column names cleaned")
        
        #Map Excel columns to staging table columns
        column_mapping = {
            0: 'unit_code',          
            1: 'unit_name',         
            2: 'session_code',      
            3: 'anticipated_enrolments', 
            4: 'actual_enrolments',
            5: 'allocation_status',  
            6: 'error_text',
            7: 'activity_type',
            8: 'activity_description',
            9: 'activity_name',
            10: 'activity_date',
            11: 'activity_start',
            12: 'activity_end',
            13: 'paycode',
            14: 'teaching_role', 
            15: 'staff_id',
            16: 'staff_name',
            17: 'faculty', 
            18: 'school', 
            19: 'department',
            20: 'units_hrs'
        }
        
        df.columns = [column_mapping.get(i, f'column_{i}') for i in range(len(df.columns))]
                
        #Handle dates
        if 'activity_date' in df.columns:
            df['activity_date'] = df['activity_date'].apply(parse_date)
        
        #Handle times
        if 'activity_start' in df.columns:
            if df['activity_start'].dtype == 'object':
                if isinstance(df.iloc[0]['activity_start'], time):
                    pass
                else:
                    df['activity_start'] = df['activity_start'].apply(parse_time)
        if 'activity_end' in df.columns:
            if df['activity_end'].dtype == 'object':
                if isinstance(df.iloc[0]['activity_end'], time):
                    pass
                else:
                    df['activity_end'] = df['activity_end'].apply(parse_time)
        
        #Handle numeric fields
        if 'anticipated_enrolments' in df.columns:
            df['anticipated_enrolments'] = df['anticipated_enrolments'].apply(clean_numeric)
        if 'actual_enrolments' in df.columns:
            df['actual_enrolments'] = df['actual_enrolments'].apply(clean_numeric)
        
        #Handle units_hrs
        if 'units_hrs' in df.columns:
            if df['units_hrs'].dtype == 'object':
                df['units_hrs'] = df['units_hrs'].astype(str).str.replace('%', '').str.replace(' ', '')
                df['units_hrs'] = pd.to_numeric(df['units_hrs'], errors='coerce') / 100
        
        #Remove rows with missing critical data
        critical_columns = ['unit_code', 'unit_name', 'session_code', 'activity_type']
        df = df.dropna(subset=critical_columns)
        
        #Connect to database
        print("Connecting to database...")
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        #Clear existing staging data
        cursor.execute("DELETE FROM staging_semester_data")
        
        #Prepare data for insertion
        staging_columns = [
            'unit_code', 'unit_name', 'session_code', 'anticipated_enrolments',
            'actual_enrolments', 'allocation_status', 'activity_type', 'activity_description',
            'activity_name', 'activity_date', 'activity_start', 'activity_end',
            'paycode', 'teaching_role', 'staff_id', 'staff_name', 'faculty',
            'school', 'department', 'units_hrs'
        ]
        
        #Error out text filter (?????) ok for now
        available_columns = [col for col in staging_columns if col in df.columns and col != 'error_text']
        
        #Prepare data
        data_tuples = []
        for _, row in df.iterrows():
            values = []
            for col in available_columns:
                value = row.get(col)
                if pd.isna(value):
                    values.append(None)
                else:
                    values.append(value)
            data_tuples.append(tuple(values))
        
        #Insert data
        if data_tuples:
            placeholders = ','.join(['%s'] * len(available_columns))
            insert_query = f"INSERT INTO staging_semester_data ({', '.join(available_columns)}) VALUES %s"
            
            execute_values(cursor, insert_query, data_tuples)
            conn.commit()
            print(f"Successfully inserted {len(data_tuples)} rows into staging_table")
        else:
            print("No data to insert")
        
        #Close connection
        cursor.close()
        conn.close()
        
        print("Data loading completed successfully!")
        return True
        
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        return False

if __name__ == "__main__":
    import argparse
    
    #Set up command line argument parsing
    parser = argparse.ArgumentParser(description='Data Loader')
    parser.add_argument('excel_file', required=True)
    parser.add_argument('--host', default='localhost', required=True)
    parser.add_argument('--database', required=True)
    parser.add_argument('--user', required=True)
    parser.add_argument('--password', required=True)
    parser.add_argument('--port', required=True)
    
    args = parser.parse_args()
    
    #Database config
    db_config = {
        'host': args.host,
        'database': args.database,
        'user': args.user,
        'password': args.password,
        'port': args.port
    }
    
    excel_file = args.excel_file
    
    print("=" * 40)
    print(f"Loading data from: {excel_file}")
    print(f"Database: {args.database} on {args.host}:{args.port}")
    print("=" * 40)
    
    #Load data
    success = load_excel_to_staging(excel_file, db_config)