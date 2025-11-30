import pandas as pd
import os

'''
Data exceeds 1MB file req for GitHub, even when compressed
This script takes Excel files with SNAP data from 1989-2004 and combines them into a csv
Original data is by counyt, this script aggregates it by state and year
'''

input_directory = '../SNAP'
output_directory = '../interactive_viz/data/raw_data'
dfs = []

for filename in os.listdir(input_directory):
    file_path = os.path.join(input_directory, filename)
    
    # Get year from filename
    year = filename.replace('JAN ', '').replace('Jan ', '').split('.')[0]
    
    # header in row 3
    df = pd.read_excel(file_path, header=3)
    
    # col for year
    df['Year'] = year
    
    # drop NaNs
    df = df.loc[:, ~df.columns.str.contains('^Unnamed|^NaN')]
    df = df.dropna()
    
    # get state from the region name
    df['State'] = df['Substate/Region'].str.extract(r'\b([A-Z]{2})\b', expand=False)
    df = df.drop(columns=['Substate/Region'])

    # convert all cols to numeric (except state and year)
    cols_to_convert = [col for col in df.columns if col not in ['State', 'Year']]
    df[cols_to_convert] = df[cols_to_convert].apply(pd.to_numeric, errors='coerce')

    # Group by state and year, sum other cols
    df_grouped = df.groupby(['State', 'Year'], as_index=False).sum()

    # append to list of dfs
    dfs.append(df_grouped)

# concat all dfs
final_df = pd.concat(dfs, ignore_index=True)
final_df.reset_index(drop=True, inplace=True)

# Output to csv
output_path = os.path.join(output_directory, 'state_snap.csv')
final_df.to_csv(output_path, index=False)

# test print
print(final_df.head())
