import numpy as np
from PIL import Image
import math

# Define the colors (RGB values)
START_COLOR = np.array([208, 189, 201])  # #d0bdc9
END_COLOR = np.array([252, 63, 116])     # #fc3f74
BACKGROUND_COLOR = np.array([20, 20, 31])  # #14141f (if needed for extra checks)

# Function to calculate the color distance
def color_distance(c1, c2):
    return np.sqrt(np.sum((c1 - c2) ** 2))

# Function to extract recoil points based on color distance
def extract_recoil_points(png_path: str, start_color: np.ndarray, end_color: np.ndarray, num_points: int):
    # Open the PNG file
    img = Image.open(png_path)
    img = img.convert("RGBA")  # Ensure it's in RGBA mode to handle transparency
    img_np = np.array(img)

    # Get the dimensions of the image
    height, width, _ = img_np.shape
    
    # List to store recoil points
    points = []
    
    # Iterate over all pixels and check if the pixel is not transparent
    for y in range(height):
        for x in range(width):
            pixel = img_np[y, x]
            
            # Skip transparent pixels
            if pixel[3] == 0:  # The alpha channel is 0 for transparent pixels
                continue

            # Calculate color distance from the start color
            dist_start = color_distance(pixel[:3], start_color)
            dist_end = color_distance(pixel[:3], end_color)
            points.append((x, y, pixel[:3], dist_start, dist_end))  # Store (x, y, color, dist_start, dist_end)
    
    # Sort the points by the color distance to the start color (dist_start)
    points.sort(key=lambda p: p[3])  # Sorting by distance to start color (p[3] is the dist_start)
    
    # Extract the top 'num_points' closest points
    sorted_points = [(p[0], p[1]) for p in points[:num_points]]
    
    return sorted_points

# Usage
png_path = "points_image.png"  # Path to the PNG file
num_points = 30  # We need 30 points
recoil_points = extract_recoil_points(png_path, START_COLOR, END_COLOR, num_points)

print("Detected recoil pattern points:", recoil_points)
