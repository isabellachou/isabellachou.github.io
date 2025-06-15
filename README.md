# From 315 ppm to Over 420 ppm: CO₂ Levels Are Rising Faster Than Ever Before

This project is an interactive narrative visualization of atmospheric carbon dioxide (CO₂) levels from 1958 to 2025, based on NASA’s data. It was created as part of a narrative visualization assignment, showcasing how data storytelling can communicate climate urgency.

**Live Website:** https://isabellachou.github.io/

## Project Purpose
The goal is to help viewers understand how CO₂ levels have risen dramatically over time and how this rise has accelerated, particularly in recent decades. The visualization invites users to engage with the data through interactive tooltips, scene transitions, and annotations.

## Features
- **Interactive Slideshow Structure:** Navigate between 4 chronological scenes using navigation buttons.
- **Animated Line Chart:** Displays CO₂ levels over time using smooth transitions.
- **Annotations:** Highlights key years and milestones with color-coded markers.
- **Tooltip Interaction:** Hover or click to freeze tooltips and inspect values.
- **Instruction Popup:** A user-friendly tip to explain the tooltip interaction.

## Project Structure
├── index.html # Main HTML file <br />
├── style.css # CSS styling <br />
├── script.js # D3.js script with interactive scenes <br />
├── data/ <br />
│ └── co2_mm_mlo.csv # NASA CO₂ dataset

## Data Source
NASA Global Climate Change – CO₂ Vital Signs:
[https://climate.nasa.gov/vital-signs/carbon-dioxide/](https://climate.nasa.gov/vital-signs/carbon-dioxide/)

## Technologies Used
- **D3.js v7** for dynamic SVG visualization
- **HTML/CSS** for layout and styling
- **JavaScript** for state management and transitions

## How to Use
1. Visit the live site: [isabellachou.github.io](https://isabellachou.github.io/)
2. Use the **Next**, **Back**, or **1 - 4** buttons to navigate scenes.
3. Hover over the chart to view monthly CO₂ levels.
4. Click on the chart to **pin/unpin** the tooltip.
5. Read the contextual text and watch how the data evolves.
