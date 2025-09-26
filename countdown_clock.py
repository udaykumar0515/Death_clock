import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime, timedelta
import math
import threading
import time

class CountdownClock:
    def __init__(self, root):
        self.root = root
        self.root.title("Death Clock - Countdown Timer")
        self.root.geometry("800x600")
        self.root.configure(bg='#1a1a1a')
        
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
            font=("Arial", 24, "bold"),
            fg='#ff6b6b',
            bg='#1a1a1a'
        )
        title_label.pack(pady=20)
        
        # Date selection frame
        date_frame = tk.Frame(self.root, bg='#1a1a1a')
        date_frame.pack(pady=20)
        
        tk.Label(
            date_frame, 
            text="Select Target Date:", 
            font=("Arial", 14, "bold"),
            fg='white',
            bg='#1a1a1a'
        ).pack()
        
        # Date picker frame
        picker_frame = tk.Frame(date_frame, bg='#1a1a1a')
        picker_frame.pack(pady=10)
        
        # Year selection
        tk.Label(picker_frame, text="Year:", fg='white', bg='#1a1a1a').grid(row=0, column=0, padx=5)
        self.year_var = tk.StringVar(value="2035")
        year_spinbox = tk.Spinbox(
            picker_frame, 
            from_=2024, 
            to=2100, 
            textvariable=self.year_var,
            width=10,
            font=("Arial", 12)
        )
        year_spinbox.grid(row=0, column=1, padx=5)
        
        # Month selection
        tk.Label(picker_frame, text="Month:", fg='white', bg='#1a1a1a').grid(row=0, column=2, padx=5)
        self.month_var = tk.StringVar(value="6")
        month_spinbox = tk.Spinbox(
            picker_frame, 
            from_=1, 
            to=12, 
            textvariable=self.month_var,
            width=10,
            font=("Arial", 12)
        )
        month_spinbox.grid(row=0, column=3, padx=5)
        
        # Day selection
        tk.Label(picker_frame, text="Day:", fg='white', bg='#1a1a1a').grid(row=0, column=4, padx=5)
        self.day_var = tk.StringVar(value="31")
        day_spinbox = tk.Spinbox(
            picker_frame, 
            from_=1, 
            to=31, 
            textvariable=self.day_var,
            width=10,
            font=("Arial", 12)
        )
        day_spinbox.grid(row=0, column=5, padx=5)
        
        # Hour selection
        tk.Label(picker_frame, text="Hour:", fg='white', bg='#1a1a1a').grid(row=1, column=0, padx=5, pady=5)
        self.hour_var = tk.StringVar(value="12")
        hour_spinbox = tk.Spinbox(
            picker_frame, 
            from_=0, 
            to=23, 
            textvariable=self.hour_var,
            width=10,
            font=("Arial", 12)
        )
        hour_spinbox.grid(row=1, column=1, padx=5, pady=5)
        
        # Minute selection
        tk.Label(picker_frame, text="Minute:", fg='white', bg='#1a1a1a').grid(row=1, column=2, padx=5, pady=5)
        self.minute_var = tk.StringVar(value="0")
        minute_spinbox = tk.Spinbox(
            picker_frame, 
            from_=0, 
            to=59, 
            textvariable=self.minute_var,
            width=10,
            font=("Arial", 12)
        )
        minute_spinbox.grid(row=1, column=3, padx=5, pady=5)
        
        # Start button
        self.start_button = tk.Button(
            date_frame,
            text="Start Countdown",
            command=self.start_countdown,
            font=("Arial", 14, "bold"),
            bg='#4ecdc4',
            fg='white',
            padx=20,
            pady=10,
            relief='flat'
        )
        self.start_button.pack(pady=20)
        
        # Canvas for circular countdown
        self.canvas = tk.Canvas(
            self.root, 
            width=500, 
            height=500, 
            bg='#2a2a2a',
            highlightthickness=0
        )
        self.canvas.pack(pady=20)
        
        # Status label
        self.status_label = tk.Label(
            self.root,
            text="Select a future date and click Start Countdown",
            font=("Arial", 12),
            fg='#ffd93d',
            bg='#1a1a1a'
        )
        self.status_label.pack(pady=10)
        
    def start_countdown(self):
        try:
            year = int(self.year_var.get())
            month = int(self.month_var.get())
            day = int(self.day_var.get())
            hour = int(self.hour_var.get())
            minute = int(self.minute_var.get())
            
            self.target_date = datetime(year, month, day, hour, minute)
            
            if self.target_date <= datetime.now():
                messagebox.showerror("Error", "Please select a future date!")
                return
                
            self.is_running = True
            self.start_button.config(state='disabled')
            self.status_label.config(text="Countdown Active!")
            
            # Start countdown thread
            self.countdown_thread = threading.Thread(target=self.countdown_loop, daemon=True)
            self.countdown_thread.start()
            
        except ValueError:
            messagebox.showerror("Error", "Please enter valid date and time values!")
            
    def countdown_loop(self):
        while self.is_running and self.target_date:
            now = datetime.now()
            if now >= self.target_date:
                self.is_running = False
                self.root.after(0, self.countdown_finished)
                break
                
            time_diff = self.target_date - now
            
            # Calculate time components
            years = time_diff.days // 365
            remaining_days = time_diff.days % 365
            months = remaining_days // 30
            remaining_days = remaining_days % 30
            hours = time_diff.seconds // 3600
            minutes = (time_diff.seconds % 3600) // 60
            seconds = time_diff.seconds % 60
            
            # Update display
            self.root.after(0, self.update_display, years, months, remaining_days, hours, minutes, seconds)
            time.sleep(1)
            
    def update_display(self, years, months, days, hours, minutes, seconds):
        self.canvas.delete("all")
        
        # Draw circular countdown
        center_x, center_y = 250, 250
        radius = 200
        
        # Colors for different time units
        colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
        labels = ['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds']
        values = [years, months, days, hours, minutes, seconds]
        
        # Draw outer circle
        self.canvas.create_oval(
            center_x - radius, center_y - radius,
            center_x + radius, center_y + radius,
            outline='#444', width=3
        )
        
        # Draw time segments
        angle_per_segment = 360 / 6
        start_angle = -90  # Start from top
        
        for i, (value, color, label) in enumerate(zip(values, colors, labels)):
            # Calculate angle for this segment
            current_angle = start_angle + (i * angle_per_segment)
            end_angle = current_angle + angle_per_segment
            
            # Draw segment arc
            self.canvas.create_arc(
                center_x - radius + 20, center_y - radius + 20,
                center_x + radius - 20, center_y + radius - 20,
                start=current_angle, extent=angle_per_segment,
                outline=color, width=8, style='arc'
            )
            
            # Calculate text position
            text_angle = math.radians(current_angle + angle_per_segment / 2)
            text_radius = radius - 60
            text_x = center_x + text_radius * math.cos(text_angle)
            text_y = center_y + text_radius * math.sin(text_angle)
            
            # Draw value
            self.canvas.create_text(
                text_x, text_y,
                text=str(value),
                font=("Arial", 16, "bold"),
                fill=color
            )
            
            # Draw label
            label_y = text_y + 25
            self.canvas.create_text(
                text_x, label_y,
                text=label,
                font=("Arial", 10),
                fill='white'
            )
        
        # Draw center circle
        self.canvas.create_oval(
            center_x - 30, center_y - 30,
            center_x + 30, center_y + 30,
            fill='#333', outline='#666'
        )
        
        # Draw center text
        self.canvas.create_text(
            center_x, center_y,
            text="⏰",
            font=("Arial", 20),
            fill='#ffd93d'
        )
        
        # Update status
        time_str = f"{years}y {months}m {days}d {hours:02d}:{minutes:02d}:{seconds:02d}"
        self.status_label.config(text=f"Time Remaining: {time_str}")
        
    def countdown_finished(self):
        self.canvas.delete("all")
        self.canvas.create_text(
            250, 250,
            text="⏰ TIME'S UP! ⏰",
            font=("Arial", 24, "bold"),
            fill='#ff6b6b'
        )
        self.status_label.config(text="Countdown Finished!")
        self.start_button.config(state='normal')
        messagebox.showinfo("Countdown Complete", "The countdown has finished!")

def main():
    root = tk.Tk()
    app = CountdownClock(root)
    root.mainloop()

if __name__ == "__main__":
    main()
