from PIL import Image
im = Image.open('public/dashboard_demo.webp')
frames = []
durations = []
try:
    while True:
        im.seek(im.tell())
        frames.append(im.copy())
        d = im.info.get('duration', 100)
        durations.append(int(d / 1.7))
        im.seek(im.tell() + 1)
except EOFError:
    pass
frames[0].save('public/dashboard_demo_fast.webp', save_all=True, append_images=frames[1:], duration=durations, loop=0)
