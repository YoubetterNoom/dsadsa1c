# Drag & Drop Image Canvas Editor

A web application that allows users to drag and drop images onto a canvas. Users can organize their images into different categories and create compositions by arranging them on the canvas.

## Features

- **Image Categories**: Images are organized into five categories:
  - Base
  - People
  - Body Parts
  - Cloth
  - Accessories

- **Drag & Drop Interface**: Easily drag images from the sidebar onto the canvas.

- **Image Upload**: The "+" button next to each category allows users to upload their own images to the respective category.

- **Canvas Manipulation**:
  - Move images around the canvas
  - Delete selected images with the Delete key
  - Clear the entire canvas
  - Save canvas (placeholder functionality)

## Usage

1. **Browse Categories**: Click on a category in the sidebar to view images in that category.

2. **Upload Images**: Click the "+" button next to a category to upload your own images to that category.

3. **Add Images to Canvas**: Drag an image from the sidebar and drop it onto the canvas.

4. **Manipulate Images on Canvas**:
   - Click and drag to move images around
   - Click an image to select it (highlighted with a red outline)
   - Press Delete key to remove selected image
   - Click the "Clear Canvas" button to remove all images

5. **Save Your Work**: Click the "Save Canvas" button (currently a placeholder).

## Adding Your Own Images

There are two ways to add your own images to the application:

1. **Upload through the interface**:
   - Click the "+" button next to a category
   - Select the image file(s) to upload
   - The image will immediately appear in the current category

2. **Manually add to folders**:
   - Place your images in the appropriate category folder under the `images` directory:
     - `images/base/`
     - `images/people/`
     - `images/body_parts/`
     - `images/cloth/`
     - `images/accessories/`

## Setup

1. Simply open `index.html` in a web browser to use the application.

2. No server-side setup is required as this is a client-side only application.

## Future Enhancements

- Implement actual image saving functionality
- Add image resizing and rotation
- Add layers management
- Support for uploading custom images directly through the interface (basic version implemented)
- Add undo/redo functionality
- Add image filters and effects 