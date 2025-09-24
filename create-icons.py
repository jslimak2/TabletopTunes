#!/usr/bin/env python3
"""
Simple icon generator for TabletopTunes PWA
Creates basic PNG icons in different sizes
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    """Create a simple icon with gradient background and text"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Create rounded rectangle background
    corner_radius = size // 8
    draw.rounded_rectangle(
        [0, 0, size-1, size-1], 
        corner_radius, 
        fill=(26, 26, 46, 255)  # Dark blue background
    )
    
    # Add a gradient-like effect with overlays
    overlay_color = (78, 205, 196, 100)  # Semi-transparent teal
    draw.rounded_rectangle(
        [0, 0, size-1, size//2], 
        corner_radius, 
        fill=overlay_color
    )
    
    # Try to use a system font, fallback to default
    try:
        font_size = size // 4
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Add text/symbols
    text = "🎵🎲"
    if size < 100:
        text = "TT"  # Fallback for smaller sizes
    
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    return img

def main():
    """Generate all required icon sizes"""
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    icons_dir = "icons"
    
    os.makedirs(icons_dir, exist_ok=True)
    
    for size in sizes:
        print(f"Creating {size}x{size} icon...")
        icon = create_icon(size)
        icon.save(f"{icons_dir}/icon-{size}x{size}.png", "PNG")
    
    print("Icons created successfully!")

if __name__ == "__main__":
    main()