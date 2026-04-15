"""
Generate realistic household power consumption data for 14/4/2026 and 15/4/2026
to extend the existing CSV. Patterns based on observed spring April data.
"""
import random
import math

random.seed(42)

START_INDEX = 148320
DATES = ["14/4/2026", "15/4/2026"]

def clamp(val, lo, hi):
    return max(lo, min(hi, val))

def noise(base, amplitude):
    return base + random.uniform(-amplitude, amplitude)

def smooth_noise(base, amplitude):
    """Generate smoother noise with gaussian distribution."""
    return base + random.gauss(0, amplitude / 2)

def get_hourly_profile(hour, day_index):
    """
    Return (global_active_power_base, global_reactive_power_base, voltage_base,
            global_intensity_base, sub1_base, sub2_base, sub3_base) for given hour.
    
    Day 0 = April 14 (Tuesday - more active weekday with cooking, some appliance use)
    Day 1 = April 15 (Wednesday - typical weekday, moderate activity)
    """
    # Day-specific scaling factor for variation
    day_scale = 1.0 if day_index == 0 else 0.92

    if 0 <= hour < 5:
        # Late night / early morning - standby load
        return (0.38 * day_scale, 0.20, 240.0, 1.8, 0, 1, 0)
    elif 5 <= hour < 6:
        # Pre-dawn - slight ramp up
        return (0.42 * day_scale, 0.18, 240.5, 2.0, 0, 0, 0)
    elif 6 <= hour < 7:
        # Early morning - waking up
        return (0.85 * day_scale, 0.10, 239.5, 3.6, 0, 0, 2)
    elif 7 <= hour < 8:
        # Morning - breakfast, coffee maker, toaster
        return (2.2 * day_scale, 0.12, 238.0, 9.4, 8, 0, 5)
    elif 8 <= hour < 9:
        # Post-breakfast - dishwasher or cleanup
        return (1.6 * day_scale, 0.08, 238.5, 6.8, 2, 3, 2)
    elif 9 <= hour < 11:
        # Mid-morning - moderate activity (laundry on one day)
        sub2 = 6 if (day_index == 0 and 9 <= hour < 10) else 1
        return (0.9 * day_scale, 0.06, 239.5, 3.8, 0, sub2, 0)
    elif 11 <= hour < 12:
        # Late morning - lower activity
        return (0.5 * day_scale, 0.04, 240.5, 2.2, 0, 1, 0)
    elif 12 <= hour < 13:
        # Lunch time - some kitchen activity
        return (1.4 * day_scale, 0.10, 239.0, 6.0, 12, 1, 0)
    elif 13 <= hour < 14:
        # Post-lunch
        return (0.65 * day_scale, 0.08, 240.0, 2.8, 1, 1, 0)
    elif 14 <= hour < 16:
        # Afternoon - low activity, maybe some work
        return (0.35 * day_scale, 0.06, 241.0, 1.4, 0, 0, 0)
    elif 16 <= hour < 17:
        # Late afternoon - some activity picking up
        return (0.55 * day_scale, 0.08, 240.5, 2.4, 0, 1, 0)
    elif 17 <= hour < 18:
        # Early evening - cooking starts
        sub1 = 18 if day_index == 0 else 10
        return (2.8 * day_scale, 0.14, 238.0, 12.0, sub1, 1, 0)
    elif 18 <= hour < 19:
        # Dinner time - oven, stove
        sub1 = 35 if day_index == 0 else 22
        return (3.5 * day_scale, 0.18, 236.5, 14.8, sub1, 2, 0)
    elif 19 <= hour < 20:
        # Post dinner - dishwasher, entertainment
        return (2.1 * day_scale, 0.16, 237.5, 8.8, 3, 4, 0)
    elif 20 <= hour < 21:
        # Evening entertainment - TV, lights
        sub3 = 17 if day_index == 1 else 0  # Heating kicks in on cooler evening
        return (1.8 * day_scale, 0.14, 238.5, 7.6, 1, 1, sub3)
    elif 21 <= hour < 22:
        # Late evening - winding down
        return (1.2 * day_scale, 0.12, 239.5, 5.0, 0, 1, 0)
    elif 22 <= hour < 23:
        # Night - preparing for bed
        return (0.6 * day_scale, 0.16, 240.0, 2.6, 0, 1, 0)
    else:  # 23
        # Late night - standby
        return (0.42 * day_scale, 0.22, 240.2, 2.0, 0, 1, 0)


def generate_minute_data(date, day_index, start_idx):
    """Generate 1440 rows (one per minute) for a given date."""
    rows = []
    prev_gap = 0.0
    prev_grp = 0.0
    prev_voltage = 240.0
    prev_intensity = 2.0

    for minute_of_day in range(1440):
        hour = minute_of_day // 60
        minute = minute_of_day % 60
        idx = start_idx + minute_of_day

        gap_base, grp_base, v_base, gi_base, s1_base, s2_base, s3_base = \
            get_hourly_profile(hour, day_index)

        # Add transitions between hours - smooth ramp in first/last 10 minutes
        next_hour = min(hour + 1, 23)
        if minute >= 50:
            # Blend toward next hour's profile
            blend = (minute - 50) / 10.0
            gap_next, grp_next, v_next, gi_next, s1_next, s2_next, s3_next = \
                get_hourly_profile(next_hour, day_index)
            gap_base = gap_base * (1 - blend) + gap_next * blend
            grp_base = grp_base * (1 - blend) + grp_next * blend
            v_base = v_base * (1 - blend) + v_next * blend
            gi_base = gi_base * (1 - blend) + gi_next * blend
            s1_base = s1_base * (1 - blend) + s1_next * blend
            s2_base = s2_base * (1 - blend) + s2_next * blend
            s3_base = s3_base * (1 - blend) + s3_next * blend

        # Add realistic noise with temporal smoothing (values don't jump wildly)
        gap = smooth_noise(gap_base, gap_base * 0.08)
        grp = smooth_noise(grp_base, grp_base * 0.12)
        voltage = smooth_noise(v_base, 1.2)
        intensity = smooth_noise(gi_base, gi_base * 0.06)

        # Apply temporal smoothing - values change gradually
        alpha = 0.7  # smoothing factor
        gap = alpha * gap + (1 - alpha) * prev_gap
        grp = alpha * grp + (1 - alpha) * prev_grp
        voltage = alpha * voltage + (1 - alpha) * prev_voltage
        intensity = alpha * intensity + (1 - alpha) * prev_intensity

        # Clamp to realistic ranges
        gap = clamp(round(gap, 3), 0.076, 8.0)
        grp = clamp(round(grp, 3), 0.0, 1.5)
        voltage = clamp(round(voltage, 2), 223.0, 254.0)
        intensity = clamp(round(intensity, 1), 0.2, 34.0)

        # Sub-metering with integer-like noise
        s1 = max(0, round(s1_base + random.gauss(0, max(0.5, s1_base * 0.15))))
        s2 = max(0, round(s2_base + random.gauss(0, max(0.3, s2_base * 0.2))))
        s3_val = max(0, round(s3_base + random.gauss(0, max(0.3, s3_base * 0.15))))

        # Add occasional appliance spikes (random events)
        if random.random() < 0.003:  # ~4 spikes per day
            spike_type = random.choice(["kitchen", "laundry", "heating"])
            if spike_type == "kitchen":
                s1 += random.randint(15, 40)
                gap += random.uniform(0.5, 2.0)
                intensity += random.uniform(2.0, 8.0)
            elif spike_type == "laundry":
                s2 += random.randint(5, 20)
                gap += random.uniform(0.3, 1.5)
                intensity += random.uniform(1.0, 6.0)
            else:
                s3_val += random.randint(10, 20)
                gap += random.uniform(0.4, 1.2)
                intensity += random.uniform(1.5, 5.0)
            gap = clamp(round(gap, 3), 0.076, 8.0)
            intensity = clamp(round(intensity, 1), 0.2, 34.0)

        # Ensure intensity is consistent with power (rough relationship: I ≈ P*1000/V * some factor)
        # But keep the noise-based value as primary

        time_str = f"{hour}:{minute:02d}:00"
        # Format sub_metering_3 with .0 like the original data
        row = f"{idx},{date},{time_str},{gap},{grp},{voltage},{intensity},{s1},{s2},{s3_val}.0"
        rows.append(row)

        prev_gap = gap
        prev_grp = grp
        prev_voltage = voltage
        prev_intensity = intensity

    return rows


def main():
    all_rows = []
    current_idx = START_INDEX

    for day_idx, date in enumerate(DATES):
        day_rows = generate_minute_data(date, day_idx, current_idx)
        all_rows.extend(day_rows)
        current_idx += 1440

    # Write to a temporary file
    output_path = r"c:\Develop\workshop-lueneburg\src\smart-powered-home\public\new_data.csv"
    with open(output_path, "w", newline="\n") as f:
        for row in all_rows:
            f.write(row + "\n")

    print(f"Generated {len(all_rows)} rows")
    print(f"Index range: {START_INDEX} - {START_INDEX + len(all_rows) - 1}")
    print(f"Output: {output_path}")
    print(f"\nFirst 5 rows:")
    for r in all_rows[:5]:
        print(r)
    print(f"\nLast 5 rows:")
    for r in all_rows[-5:]:
        print(r)
    # Sample from midday
    print(f"\nMidDay sample (index ~720):")
    for r in all_rows[718:723]:
        print(r)
    # Sample from evening peak
    print(f"\nEvening peak sample (index ~1100):")
    for r in all_rows[1098:1103]:
        print(r)


if __name__ == "__main__":
    main()
