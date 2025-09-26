# ⏰ Death Clock - Countdown Timer

A beautiful Python countdown clock application that allows you to select a future date and displays a circular countdown with rotating elements for years, months, days, hours, minutes, and seconds.

## Features

- 🎯 **Date Selection**: Choose any future date and time using intuitive spinboxes
- 🎨 **Circular Display**: Beautiful circular countdown with color-coded segments
- ⚡ **Real-time Updates**: Live countdown that updates every second
- 🎭 **Modern UI**: Dark theme with vibrant colors and smooth animations
- 📱 **Responsive Design**: Clean, modern interface that's easy to use

## Screenshots

The application features:
- A dark theme with colorful circular segments
- Each time unit (years, months, days, hours, minutes, seconds) has its own colored segment
- Real-time countdown display
- Intuitive date/time picker interface

## Installation

1. **Clone or download** this repository
2. **Ensure Python 3.7+** is installed on your system
3. **No additional dependencies** required - uses only Python standard library

## Usage

1. **Run the application**:
   ```bash
   python countdown_clock.py
   ```

2. **Select your target date**:
   - Choose the year (2024-2100)
   - Select the month (1-12)
   - Pick the day (1-31)
   - Set the hour (0-23)
   - Choose the minute (0-59)

3. **Start the countdown**:
   - Click "Start Countdown" button
   - Watch the circular countdown display update in real-time

4. **Features**:
   - Each segment represents a different time unit
   - Colors: Red (Years), Teal (Months), Blue (Days), Green (Hours), Yellow (Minutes), Pink (Seconds)
   - The countdown updates every second
   - When finished, displays "TIME'S UP!" message

## Technical Details

- **GUI Framework**: tkinter (Python standard library)
- **Threading**: Background countdown thread for smooth updates
- **Graphics**: Canvas-based circular drawing with mathematical calculations
- **Date Handling**: datetime module for precise time calculations
- **Cross-platform**: Works on Windows, macOS, and Linux

## Example Usage

Set a countdown for:
- **New Year 2035**: Year: 2035, Month: 1, Day: 1, Hour: 0, Minute: 0
- **Your Birthday**: Choose your future birthday date
- **Project Deadline**: Set any future project deadline
- **Special Event**: Countdown to any important date

## Color Scheme

- 🔴 **Years**: Red (#ff6b6b)
- 🔵 **Months**: Teal (#4ecdc4)  
- 🟦 **Days**: Blue (#45b7d1)
- 🟢 **Hours**: Green (#96ceb4)
- 🟡 **Minutes**: Yellow (#feca57)
- 🟣 **Seconds**: Pink (#ff9ff3)

## Requirements

- Python 3.7 or higher
- tkinter (included with Python)
- No external packages required

## License

This project is open source and available under the MIT License.

---

**Enjoy your countdown experience!** ⏰✨
