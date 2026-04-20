from PIL import Image
import sys

def remove_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Simple threshold - if it's very bright/white-ish, make it transparent
            # Also to handle the checkered background, DALL-E usually outputs exactly
            # #ffffff and #cccccc or similar. 
            # But the user uploaded a new `pb4.jpg` which had a white background.
            if r > 240 and g > 240 and b > 240:
                pixels[x, y] = (r, g, b, 0)
            elif r > 200 and g > 200 and b > 200:
                # Semi-transparent for anti-aliasing edges
                alpha = int(255 * (255 - (r + g + b) / 3) / 55)
                pixels[x, y] = (r, g, b, max(0, min(255, alpha)))

    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_bg("public/pb4.jpg", "public/pb4_no_bg.png")
