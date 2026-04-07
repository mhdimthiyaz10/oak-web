import sys
import subprocess

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def remove_background(input_path, output_path, threshold=240):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == '__main__':
    in_file = r"C:\Users\Mohammed Imthiyaz\.gemini\antigravity\brain\cb2f3a9b-60a6-49b6-a405-727afd70941d\media__1775207070209.png"
    out_file = "team-oak-logo.png"
    remove_background(in_file, out_file)
    print("Done")
