from PIL import Image
import numpy as np

# Define color thresholds (RGB values)
START_COLOR = (208, 189, 201)  # #d0bdc9
END_COLOR = (252, 63, 116)     # #fc3f74
BACKGROUND_COLOR = (20, 20, 31)  # #14141f

# Function to calculate Euclidean distance between two RGB colors
def color_distance(c1, c2):
    return np.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

# Function to extract recoil points based on color interpolation
def extract_recoil_points(gif_path: str, start_color: tuple, end_color: tuple, background_color: tuple, threshold: float):
    # Open the GIF file
    img = Image.open(gif_path)
    
    points = []  # List to store detected points
    
    # Iterate through each frame in the GIF
    try:
        while True:
            # Convert the current frame to RGB
            frame = img.convert("RGB")
            frame_np = np.array(frame)
            
            # Find all pixels that match the start or end color (ignoring background color)
            for y in range(frame_np.shape[0]):
                for x in range(frame_np.shape[1]):
                    pixel = frame_np[y, x]
                    
                    # Check the pixel distance to the start and end colors
                    dist_to_start = color_distance(pixel, start_color)
                    dist_to_end = color_distance(pixel, end_color)
                    
                    # If the pixel is close to either color, we include it as a recoil point
                    if dist_to_start < threshold or dist_to_end < threshold:
                        if not np.array_equal(pixel, background_color):
                            points.append((x, y))

            # Move to the next frame
            print("next frame")
            img.seek(img.tell() + 1)
    
    except EOFError:
        # End of frames
        pass
    
    return points

# Usage
gif_path = "ak47_recoil.gif"  # Path to the GIF file
threshold = 50  # Adjust the threshold value based on your color transition range
recoil_points = extract_recoil_points(gif_path, START_COLOR, END_COLOR, BACKGROUND_COLOR, threshold)

# Only return 30 points (you can adjust this as needed)
recoil_points = recoil_points[:30]

print("Detected recoil pattern points:", recoil_points)

with open('.txt','w') as f:
    f.write(recoil_points)
