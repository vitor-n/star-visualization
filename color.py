
import re
import math
import pandas as pd

df = pd.read_csv("./stars/star_data.csv")

df = df[df.diameter > 0]

def categorize_distance(distance):
    range_start = int(distance // 20) * 20
    range_end = range_start + 20
    return f'{range_end}'

def log_diameter_maker(diameter):
    log_diameter = math.log(diameter, 10)

    return log_diameter

def extract_float_after_bv(string):
    if isinstance(string, str):
        match = re.search(r"B-V= \+(\d+\.\d+)", string)
        if match:
            float_value = float(match.group(1))
            return float_value
        else:
            return 1
    else:
        return 1

def get_temp(bv):
    temp_kelvin = 7090 * 1/((bv + 0.71)**(2/3))

    return round(temp_kelvin, 2)
"""
df['distance_type'] = df['distance_l'].apply(categorize_distance)
df['log_diameter'] = df['diameter'].apply(log_diameter_maker)
df['B-V'] = df['color'].apply(extract_float_after_bv)
df['star_temp'] = df['B-V'].apply(get_temp)

df.to_csv('star_data.csv', index=False)"""


print(df.mag.max())