# Spotfire Scrollable Bar Chart

This is a Spotfire mod project to create a horizontal bar chart, which adds a scroll bar if more bars needs to be shown instead on decreasing the bar size.

This difference in layout concept compared to standard bar chart ensures, that labels of the bars are allways visible, readable in standard font size and without ellipsis. 

[![ScreenShot](/screenshots/screenshot-scrollable-vs-standard-bar-chart_thumbnail.png?raw=true)](/screenshots/screenshot-scrollable-vs-standard-bar-chart.png?raw=true)

Scrollable Bar Chart is released under the [MIT License](LICENSE). All source code for the mod can be found in the `src` folder.

## To Do's

- Marking by click on category
- Marking by rectangle selection
- Tooltip incl. highlighting border
- Show total value

## Known Limitations 

As of now, but planning to enhance the visualization mod in this direction

- Hierarchy shown as category axis
- Horizontal scale axis

Not planned to be supported by this visualization mod

- No vertical bar chart
- No support for error bars (currently no plan to enhance the mod in this direction)
- No 100% bars
- No i18n of title, axis labels and description


## How to get started with Spotfire mod development 

- These instructions assume that you have [Node.js](https://nodejs.org/en/) (which includes npm) installed.
- Open a terminal at the location of this example.
- Run `npm install`. This will install necessary tools. Run this command only the first time you are building the mod and skip this step for any subsequent builds.
- Run `npm run server`. This will start a development server.
- In Spotfire, follow the steps of creating a new mod and connecting to the development server.

