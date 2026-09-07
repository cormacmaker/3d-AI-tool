# 3D AI Tool

An AI-first 3D creation workspace designed to turn natural-language prompts into high-quality, editable 3D models.

## Vision

- Generate detailed 3D models from natural-language prompts.
- Inspect, rotate, zoom, and edit models in a browser-based 3D viewport.
- Ask the AI to modify an existing model without starting over.
- Keep models editable and versioned.
- Export to formats such as GLB and STL.
- Support different targets, including game-ready and 3D-print-ready models.

## Architecture

The project is intentionally designed around an AI generation pipeline rather than treating AI as an afterthought:

`Prompt → AI planning → geometry/model generation → quality checks → 3D viewport → iterative AI editing → export`

## Development

The first milestone is a clean browser-based foundation with a 3D viewport, project structure, model representation, and an AI-ready interface. Heavy model generation can run through a backend service so the browser remains usable on lower-powered devices such as Chromebooks.
