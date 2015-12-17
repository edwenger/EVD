
// ****** Histogram code ********

//parent function
var Histogram = function(sets){

	//settings
	var self = this
	self.height = 100
	self.width = 360
	self.padding = { 'xAxis': 5,
					 'yAxis': 25,
					 'rightEdge': 5,
					 'topEdge': 5
					}


	// Is this redundant and already included?
	//default and mouseover values for boundaries
	var border_settings = {
		'default': {
			'stroke-width': 0.2,
			'stroke-opacity': 0.5
		},
		'mouseenter': {
			'stroke-width': 1.5,
			'stroke-opacity': 0.6
		}
	}

	self.data = sets.data
	self.title = sets.title
	self.color = sets.color
	self.mapType = sets.mapType
	self.countrySettings = sets.settings

	//append div and svg
	self.svg = d3.select('#hist-container').append('svg')
				 .attr('id', self.title.replace(/\s/g, '_').replace(/[()]/g, '').toLowerCase() + '-svg')
				 .attr('class','case-hist')
				 .style('width', self.width)
				 .style('height', self.height)
				.on('mouseenter', function(d){
						var obj = $(this)
						//make a box around the histogram you're on
						// var svgId = '#' + obj.context.id
						// d3.select(svgId).append('rect')
						// 	.attr('height', 100)
						// 	.attr('width', 360)
						// 	.attr('stroke', 'black')
						// 	.attr('stroke-width', border_settings['mouseenter']['stroke-width'])
						// 	.attr('fill-opacity', 0)
						// 	.attr('class', 'box')

						//change the border width of the subnat your histogram is of
						var shapeId = '#' + obj.context.id.replace('-svg', '')
					d3.selectAll(shapeId).style('stroke-width', border_settings['mouseenter']['stroke-width'])
							.style('stroke-opacity', border_settings['mouseenter']['stroke-opacity'])
				})
				.on('mouseleave', function(d){ 
						//make the box go away
						var obj = $(this)
						//d3.selectAll('.box').remove()
						//change the border widths back
						var shapeId = '#' + obj.context.id.replace('-svg', '')
					d3.selectAll(shapeId).style('stroke-width', border_settings['default']['stroke-width'])
							.style('stroke-opacity', border_settings['default']['stroke-opacity'])
					})

	//create scales that both the axes and the rects will use for sizing
	var allScales = {}
	allScales['xScale'] =  d3.scale.linear()
									.domain([0, 1+d3.max(self.data, function(d){return d.id})])
									.range([0, self.width-self.padding['xAxis'] - self.padding['rightEdge']])
	
	allScales['yScale'] =  d3.scale.linear()
									.domain([0, sets.max])
									.range([0, self.height - self.padding['yAxis'] - self.padding['topEdge'] ])

	allScales['yAxisScale'] = d3.scale.linear()
									.domain([0, sets.max])
									.range([self.height - self.padding['yAxis'] - self.padding['topEdge'], 0])

	allScales['xWidth'] = allScales['xScale'](1) - allScales['xScale'](0) -1

	// convert 52 week numeric scale to months for x-axis labeling
	allScales['timeScale'] = d3.time.scale()
		.domain([new Date(2014, 3, 12), new Date(2015, 3, 11)])
		.range([0, self.width - self.padding['xAxis'] - self.padding['rightEdge']])

	//get x-and y-axis set up
	allScales['xAxisFunction'] = d3.svg.axis()
		.scale(allScales['timeScale'])
		.orient("bottom")
		.ticks(d3.time.months)
		.tickSize(6, 0)
		.tickFormat(d3.time.format("%b"));

	allScales['yAxisFunction'] = d3.svg.axis()
				.scale(allScales['yAxisScale'])
				.orient('left')
				.ticks(2)

	self.scaleFunctions = allScales

	//position rects within svg
	self.rectFeatures = function (rect) {
		rect.attr('width', allScales['xWidth'])
			.attr('height', function(d){return allScales['yScale'](d.cases)})
			.attr('x', function(d){return (allScales['xScale'](d.id) + self.padding['xAxis']) })
			.attr('y', function(d){return (self.height - self.padding['yAxis']) - allScales['yScale'](d.cases)})
			.attr('id', function (d) { return d.id })
			.style('fill', function(d){
				if ( self.mapType=='subnational'){
					return self.color
				}
				else {
					return self.color[self.title]
				}
			})
			.style('fill-opacity', 0.5)

	}

	self.draw()
}

//function to draw rects, axes, and labels
Histogram.prototype.draw = function() {
	var self=this

	//draw axes

	//x-axis
	self.svg 
			.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(' + self.padding['xAxis'] + ',' + (self.height - self.padding['yAxis']) +')')
			.call(self.scaleFunctions['xAxisFunction'])
	  .selectAll(".tick text")
		.style("text-anchor", "start")
		.attr("x", 4)
		.attr("y", 4);

	//y-axis
	self.svg
			.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(' + self.padding['xAxis']+ ','+ self.padding['topEdge'] + ')')
			.call(self.scaleFunctions['yAxisFunction'])
	  .append("text")
		//.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("x", 6)
		.attr("dy", ".71em")
		.attr("class","district-text")
		//.style("text-anchor", "end")
		.text(function(d){
			if (self.mapType=='subnational'){
				return self.title
			}
			else{
				return self.countrySettings[self.title]['fullName']
			}
		});

	//draw rects 
	self.rects = self.svg.selectAll('rect')
		.data(self.data)

	self.rects.enter().append('rect').call(self.rectFeatures)
			.on('mouseenter', function(d){  //make border thicker on mouseover
				var obj = $(this)
				//obj.context.style['stroke'] = 'black'
				//obj.context.style['stroke-width'] = border_settings['mouseenter']['stroke-width']
				//obj.context.style['stroke-opacity'] = border_settings['mouseenter']['stroke-opacity']
				obj.context.style['fill-opacity'] = 1
			})
			.on('mouseleave', function(d){ //make border thinner when mouse leaves
				var obj = $(this)
				//obj.context.style['stroke-width'] = 0
				//obj.context.style['stroke-opacity'] = 0
				obj.context.style['fill-opacity'] = 0.5
			})

	self.rects.exit().remove()
	self.rects.transition().duration(500).call(self.rectFeatures)

}


// ****** View code ********

//EbolaView will create the full set of charts for this viz
//to start: just histograms
// TODO: incorporate mapping function

var EbolaView = function(iso3, mapType){
	var self = this
	self.charts = []
	self.iso3 = iso3.toUpperCase()
	self.mapType = mapType
	self.build()
} 

// build function
EbolaView.prototype.build = function(){
	var self = this
	self.prepData()
	self.makePlots()
	//self.makeInteractive()
}

// prep data
EbolaView.prototype.prepData = function(){
	var self=this

	//we want to use different datasets and do slightly different things with color depending on whether we're mapping national or subnational
	var country_settings = {'GIN': {'color':'navy',
								  'fullName': 'Guinea'
								},
						  'SLE': {'color':'olive',
								  'fullName': 'Sierra Leone'
								},
						  'LBR': {'color': 'firebrick',
								  'fullName': 'Liberia'}
								}

	if (self.mapType=='subnational'){
		var initial_data = all_case_data[self.iso3]
		self.color = country_settings[self.iso3]['color']
	}
	else {
		var initial_data = national_cases
		var country_colors = {}
		d3.keys(country_settings).map(function(d){
			country_colors[d] = country_settings[d]['color']
		})
		self.color = country_colors
	}
	self.countrySettings = country_settings

	//sorting districts by cumulative counts
	try {
	    if (self.mapType == 'subnational') {
	        sorted_keys = d3.keys(initial_data['Recent']).sort(function (a, b) {
	            recent_diff = -(initial_data['Recent'][a] - initial_data['Recent'][b])
	            if (recent_diff != 0) {
	                return recent_diff
	            } else {
	                return -(initial_data['Cumulative'][a] - initial_data['Cumulative'][b])
	            }
	        });
	    } else {
	        sorted_keys=d3.keys(initial_data['Cumulative']).sort(function (a, b) { return -(initial_data['Cumulative'][a] - initial_data['Cumulative'][b]) });
	    }
	}
	catch (e) {
		sorted_keys = d3.keys(initial_data)
	}

	self.data = []
	var alldata = []
	sorted_keys
		.map(function (d) {
		var cases = initial_data[d]
		alldata.push.apply(alldata, cases)
		if (!cases) {
			return;
		}
		var obs = cases.length
		var data = []
		
		d3.range(obs).map(function(d,i){ 
			data.push({id:i, cases:cases[i]})
		})
		self.data[d] = data
	})
	//we want each plot to be scaled to the maximum among all districts, not just its own max
	self.maxdata = d3.max(alldata) 

}

//make plots 
EbolaView.prototype.makePlots = function(){
	var self = this
	d3.keys(self.data).map(function(d){
		self.charts[d] = new Histogram( {
			data: self.data[d],
			title: d,
			max: self.maxdata,
			iso3: self.iso3,
			color: self.color,
			mapType: self.mapType,
			settings: self.countrySettings
			})
	})

	//set up inputs for histogram poshytip
	var rectIdentifier = '.case-hist rect'
	var rectContentFunction = function(d){
		var obj = $(this)[0]
		var cases = obj.__data__.cases
		var week = Number(obj.id)
		return cases 
	}

	makePoshyTip(rectIdentifier, rectContentFunction)
}


// ****** Instantiation code ********

//var testView = new EbolaView('GIN')
