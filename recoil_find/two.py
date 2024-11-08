from PIL import Image
import numpy as np

# Define color thresholds (RGB values)
START_COLOR = np.array([208, 189, 201])  # #d0bdc9
END_COLOR = np.array([252, 63, 116])     # #fc3f74
BACKGROUND_COLOR = np.array([20, 20, 31])  # #14141f

# Function to interpolate between two colors
def interpolate_color(start_color, end_color, steps):
    # Linearly interpolate between start_color and end_color
    return start_color + (end_color - start_color) * steps

# Function to extract recoil points from the last frame and interpolate colors
def extract_recoil_points(gif_path: str, start_color: np.ndarray, end_color: np.ndarray, background_color: np.ndarray, num_points: int):
    # Open the GIF file
    img = Image.open(gif_path)
    
    print(img.n_frames)
    # Jump to the last frame
    img.seek(img.n_frames - 1)
    frame = img.convert("RGB")
    frame_np = np.array(frame)
    
    points = []  # List to store detected points
    current_color = start_color  # Start with the start color
    
    # Find points until we have 30 or more points
    while len(points) < num_points:
        # Find all pixels that match the current color (ignoring background color)
        for y in range(frame_np.shape[0]):
            for x in range(frame_np.shape[1]):
                pixel = frame_np[y, x]
                
                # Compare pixel to the current color and background
                if np.array_equal(pixel, current_color) and not np.array_equal(pixel, background_color):
                    points.append((x, y))
                    print('appended',x,y)
        
        # Interpolate color closer to the end color
        current_color = interpolate_color(current_color, end_color, 0.1)
    
    return points[:num_points]  # Return the first 'num_points' points

# Usage
gif_path = "ak47_recoil.gif"  # Path to the GIF file
num_points = 30  # We need 30 points
recoil_points = extract_recoil_points(gif_path, START_COLOR, END_COLOR, BACKGROUND_COLOR, num_points)

print("Detected recoil pattern points:", recoil_points)


with open('2.txt','w') as f:
    f.write(recoil_points)
