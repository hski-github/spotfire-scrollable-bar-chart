# Spotfire Scrollable Bar Chart

This is a Spotfire mod project to create a horizontal bar chart, which adds a scroll bar if more bars needs to be shown instead on decreasing the bar size.  

All source code for the mod can be found in the `src` folder.

## Known Limitations 

As of now
- Negative values are not correctly shown
- No support for marking
- No rendering of stacked bars
- No hover with details about bar segment
- Better names for X and Y axis

## Prerequisites

These instructions assume that you have [Node.js](https://nodejs.org/en/) (which includes npm) installed.

## How to get started with Spotfire mod development 

- Open a terminal at the location of this example.
- Run `npm install`. This will install necessary tools. Run this command only the first time you are building the mod and skip this step for any subsequent builds.
- Run `npm run server`. This will start a development server.
- In Spotfire, follow the steps of creating a new mod and connecting to the development server.

