# SNAP Participation across the United States

Marie Farhat

## Goal

My goal is to visualize how SNAP participation has evolved across the US and over time, with additional economic and policy context clues. This was different than my original plan, which was to highlight SNAP usage and wealth disparity inside congressional districts, with respect to the elected representative's net worth (in retrospect, I was coming from a petty and angry place, and am now finding a lot of value and interesting trends around SNAP policies).

My aim is to try to answer some questions and dispel any negative association an audience might have with food assistance programs:
- Initially I thought more SNAP usage = bad, because that means more people are food insecure. However, higher SNAP participation could be interpreted as a good thing with a certain lens: policies are working, people have more access to food assistance, funding has increased... Policy history shows a large ramp-up from the late 80s, sadly not much new policy since 2014.
- Does SNAP participation change with the economic tides? Maybe-- recessions seem to suggest a trend could exist.
- What about other economic indicators? I'm working on incorporating state Gini coefficients, unemployment rates, and possibly CPI / purchasing power indicators.

## Data Challenges

One reason for my topic pivot: I ran into challenges with the district level data since it didn't work well with my time-series analysis (thanks to mid-decade redistricting), and I couldn't confidently match SNAP data and district maps by specific year.

Some data isn't available for each year in my dataset, so I'll either have to extrapolate the value or leave blank, dependign on how much context it provides.

## Walk Through

Select a bar from the barchart to view the corresponding SNAP Participation by state for the selected year.
Both the bars and the state maps have hover effects where you can see data at a national or state level (SNAP participation, total benefits issued...).

Coming soon: the right side of the page will display relevant economic or food assistance policy headlines for the selected year.

Stretch-goal: state-level trends (SNAP participation by year, maybe other data in a chart off to the side when the user selects a state)

## Questions

{Numbered list of questions for course staff, if any.}

1. Is it worthwhile to add an animation that would show the state changes over the years in addition to the user selection?
