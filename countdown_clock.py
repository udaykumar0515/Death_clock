import tkinter as tk
from tkinter import messagebox
from datetime import datetime
import math
import threading
import time

class CountdownClock:
    def __init__(self, root):
        self.root = root
        self.root.title("Death Clock")
        self.root.geometry("600x700")
        self.root.configure(bg='#000000')
        
        # Variables
        self.target_date = None
        self.is_running = False
        self.countdown_thread = None
        
        # Create GUI
        self.create_widgets()
        
    def create_widgets(self):
        # Main title
        title_label = tk.Label(
            self.root, 
            text="⏰ DEATH CLOCK ⏰", 
            font=("Arial", 20, "bold"),
            fg='#ff0000',
            bg='#000000'
        )
        title_label.pack(pady=20)
        
        # Simple date selection
        date_frame = tk.Frame(self.root, bg='#000000')
        date_frame.pack(pady=20)
        
        # Year and Month only
        picker_frame = tk.Frame(date_frame, bg='#000000')
        picker_frame.pack()
        
        tk.Label(picker_frame, text="Year:", fg='white', bg='#000000', font=("Arial", 12)).grid(row=0, column=0, padx=10)
        self.year_var = tk.StringVar(value="2035")
        year_spinbox = tk.Spinbox(picker_frame, from_=2024, to=2100, textvariable=self.year_var, width=8, font=("Arial", 12))
        year_spinbox.grid(row=0, column=1, padx=10)
        
        tk.Label(picker_frame, text="Month:", fg='white', bg='#000000', font=("Arial", 12)).grid(row=0, column=2, padx=10)
        self.month_var = tk.StringVar(value="6")
        month_spinbox = tk.Spinbox(picker_frame, from_=1, to=12, textvariable=self.month_var, width=8, font=("Arial", 12))
        month_spinbox.grid(row=0, column=3, padx=10)
        
        # Start button
        self.start_button = tk.Button(
            date_frame,
            text="START",
            command=self.start_countdown,
            font=("Arial", 14, "bold"),
            bg='#ff0000',
            fg='white',
            padx=30,
            pady=10
        )
        self.start_button.pack(pady=20)
        
        # Canvas for concentric circles
        self.canvas = tk.Canvas(
            self.root, 
            width=500, 
            height=500, 
            bg='#000000',
            highlightthickness=0
        )
        self.canvas.pack(pady=20)
        
    def start_countdown(self):
        try:
            year = int(self.year_var.get())
            month = int(self.month_var.get())
            
            # Set to first day of the month at midnight
            self.target_date = datetime(year, month, 1, 0, 0)
            
            if self.target_date <= datetime.now():
                messagebox.showerror("Error", "Please select a future date!")
                return
                
            self.is_running = True
            self.start_button.config(state='disabled')
            
            # Start countdown thread
            self.countdown_thread = threading.Thread(target=self.countdown_loop, daemon=True)
            self.countdown_thread.start()
            
        except ValueError:
            messagebox.showerror("Error", "Please enter valid date values!")
            
    def countdown_loop(self):
        while self.is_running and self.target_date:
            now = datetime.now()
            if now >= self.target_date:
                self.is_running = False
                self.root.after(0, self.countdown_finished)
                break
                
            time_diff = self.target_date - now
            
            # Calculate time components
            total_seconds = int(time_diff.total_seconds())
            years = total_seconds // (365 * 24 * 3600)
            remaining_seconds = total_seconds % (365 * 24 * 3600)
            months = remaining_seconds // (30 * 24 * 3600)
            remaining_seconds = remaining_seconds % (30 * 24 * 3600)
            days = remaining_seconds // (24 * 3600)
            remaining_seconds = remaining_seconds % (24 * 3600)
            hours = remaining_seconds // 3600
            remaining_seconds = remaining_seconds % 3600
            minutes = remaining_seconds // 60
            seconds = remaining_seconds % 60
            
            # Update display
            self.root.after(0, self.update_display, years, months, days, hours, minutes, seconds)
            time.sleep(1)
            
    def update_display(self, years, months, days, hours, minutes, seconds):
        self.canvas.delete("all")
        
        center_x, center_y = 250, 250
        
        # Define concentric circles with different radii (reversed order)
        circles = [
            {'radius': 50, 'color': '#ff0000', 'label': 'Years', 'value': years, 'max': 100, 'numbers': 100},
            {'radius': 80, 'color': '#ff6600', 'label': 'Months', 'value': months, 'max': 12, 'numbers': 12},
            {'radius': 110, 'color': '#ffff00', 'label': 'Days', 'value': days, 'max': 30, 'numbers': 30},
            {'radius': 140, 'color': '#00ff00', 'label': 'Hours', 'value': hours, 'max': 24, 'numbers': 24},
            {'radius': 170, 'color': '#00ffff', 'label': 'Minutes', 'value': minutes, 'max': 60, 'numbers': 60},
            {'radius': 200, 'color': '#ff00ff', 'label': 'Seconds', 'value': seconds, 'max': 60, 'numbers': 60}
        ]
        
        # Draw concentric circles with rotating numbers
        for circle in circles:
            radius = circle['radius']
            color = circle['color']
            value = circle['value']
            max_val = circle['max']
            label = circle['label']
            numbers = circle['numbers']
            
            # Draw circle outline
            self.canvas.create_oval(
                center_x - radius, center_y - radius,
                center_x + radius, center_y + radius,
                outline=color, width=2
            )
            
            # Draw numbers around the circle
            for i in range(numbers):
                # Calculate angle for this number
                angle = (i / numbers) * 360 - 90  # -90 to start from top
                angle_rad = math.radians(angle)
                
                # Position for number
                number_radius = radius - 15
                number_x = center_x + number_radius * math.cos(angle_rad)
                number_y = center_y + number_radius * math.sin(angle_rad)
                
                # Highlight current value
                if i == value:
                    # Draw highlighted number with background
                    self.canvas.create_oval(
                        number_x - 8, number_y - 8,
                        number_x + 8, number_y + 8,
                        fill=color, outline=color
                    )
                    self.canvas.create_text(
                        number_x, number_y,
                        text=str(i),
                        font=("Arial", 8, "bold"),
                        fill='white'
                    )
                else:
                    # Draw normal number
                    self.canvas.create_text(
                        number_x, number_y,
                        text=str(i),
                        font=("Arial", 6),
                        fill=color
                    )
            
            # Draw label outside the circle
            label_x = center_x + (radius + 25) * math.cos(math.radians(0))  # At 3 o'clock position
            label_y = center_y + (radius + 25) * math.sin(math.radians(0))
            
            self.canvas.create_text(
                label_x, label_y,
                text=label,
                font=("Arial", 8, "bold"),
                fill=color
            )
        
        # Draw center dot
        self.canvas.create_oval(
            center_x - 3, center_y - 3,
            center_x + 3, center_y + 3,
            fill='white', outline='white'
        )
        
    def countdown_finished(self):
        self.canvas.delete("all")
        self.canvas.create_text(
            250, 250,
            text="⏰ TIME'S UP! ⏰",
            font=("Arial", 24, "bold"),
            fill='#ff0000'
        )
        self.start_button.config(state='normal')
        messagebox.showinfo("Countdown Complete", "The countdown has finished!")

def main():
    root = tk.Tk()
    app = CountdownClock(root)
    root.mainloop()

if __name__ == "__main__":
    main()
