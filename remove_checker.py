from PIL import Image

def remove_checkerboard(input_path, output_path):
    # Open the image and convert to RGBA
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # The background is a white/grey checkerboard.
            # White and grey have high Red and high Blue values.
            # The logo itself is green (high Green, low Red/Blue) and dark green (low everything).
            # So if both Red and Blue are relatively high, it's the background.
            if r > 150 and b > 150:
                # Completely transparent
                pixels[x, y] = (r, g, b, 0)
            elif r > 100 and b > 100 and g > 100 and abs(r-g) < 30 and abs(r-b) < 30:
                # Catch darker greys in the checkerboard anti-aliasing
                pixels[x, y] = (r, g, b, 0)

    # Save as PNG to preserve transparency
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_checkerboard("public/pb4.jpg", "public/pb4_clean.png")
