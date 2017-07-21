
# Compute the statistics of the M/M/c queuing model related to congestion that we are interested.
#
# Parameters
# ----------
# lamdba : arrival rate (cars per hour)
# mu : charging rate (cars per hour)
# s : number stations
# n : number of cars
# 
# Returns
# -------
# probWait : probability of car entering queue upon arrival
# queueLength : length of the queue on average
# carsInSystem : number of cars either in the queue or in service
# stationIdle : number of stations idle
# queueWaitTime : wait time in the queue
# overallWaitTime : total wait time
computeStats = function(lambda, mu, s, n) {
	# congestion intensity
	rho = lambda/mu
	# In the following functions, see queuing-modeller.R
	
	# Compute the limiting probability of no stations occupied (idle).
	p0 = computeP0(rho, s, n)
	# Compute all the other limiting probabilities of >= 1 stations occupied.
	p = computeP(p0, lambda, mu, s, n)
	
	probWait =	computeProbWait(rho, s)
	queueLength = computeQueueLength(rho, s)
	carsInSystem = computeNumCarsInSystem(rho, s)
	stationsIdle = computeNumStationsIdle(rho, s)
	
	queueWaitTime = computeWaitingTimeInQueue(rho, s, mu)
	overallWaitTime = computeResponseTime(rho, s, mu)
	
	return(list("probWait"=probWait, "queueLength"=queueLength, 
							"carsInSystem"=carsInSystem, "stationsIdle"=stationsIdle, 
							"queueWaitTime"=queueWaitTime, "overallWaitTime"=overallWaitTime))
}

# Compute arrival rate per hour using the old arrival rate which is per q hours where q = upper - lower.
computeArrivalRatePerHour = function(oldArrivalRate, lower, upper) {
	totalTime = upper - lower
	return(oldArrivalRate/totalTime)
}

# Compute limiting probability that there are no cars in the queue and 
# in service.
computeP0 = function(rho, s, n) {
	sArr = 0:(s-1)
	a = rho/s
	p0 = sum((rho^sArr)/factorial(sArr)) + 
		(rho^s)/(factorial(s))*(1/(1-a))
	p0 = 1/p0
	return(p0)	
}

# Computes the scaled charging rate in respect to number of stations and 
# number of cars currently being charged.
computeMu = function(mu, s, n) {
	if(n <= s) {
		return(n*mu)
	} else {
		return(s*mu)
	}
}

# Computes all the limiting probabilities for number of cars possible 
# in the queue or being charged (in the system).
computeP = function(p0, lambda, mu, s, n) {
	p = p0
	for(i in 1:n) {
		p = c(p, (lambda/computeMu(mu,s,i))*p[i])
	}
	return(p)
}

# Computes the density function of the ErlangC distribution
computeErlangC = function(rho, s) {
	numer = ((rho^s)/factorial(s))*(s/(s-rho))
	sArr = 0:(s-1)
	denom = sum((rho^sArr)/factorial(sArr)) + 
		((rho^s)*s)/(factorial(s)*(s-rho))
	return(numer/denom)
}

# Computes the probability of entering the queue upon arrival.
computeProbWait = function(rho, s) {
	return(computeErlangC(rho, s))
}

# Computes the length of the queue.
computeQueueLength = function(rho, s) {
	out = (rho/(s-rho))*computeErlangC(rho, s)
	return(out)
}

# Computes the average number of cars in the queue or in service.
computeNumCarsInSystem = function(rho, s) {
	out = rho + (rho/(s-rho))*computeErlangC(rho, s)
	return(out)
}

# Computes the number of stations idle.
computeNumStationsIdle = function(rho, s) {
	return(s - rho)
}

# Computes the average wait time in the queue.
computeWaitingTimeInQueue = function(rho, s, mu) {
	out = (1/(mu*(s-rho)))*computeErlangC(rho,s)
	return(out)
}

# Computes the total wait time (in the queue and charge)
computeResponseTime = function(rho, s, mu) {
	return(1/mu + computeWaitingTimeInQueue(rho, s, mu))
}

# Convert the queue wait time, total wait time, and charging time quantities from hours to minutes.
convertStatsDfHrToMin = function(statsDf) {
 	out = statsDf
 	out = mutate(out, queueWaitTime=queueWaitTime*60, 
 					overallWaitTime=overallWaitTime*60, 
 					serviceTime=serviceTime*60)
 	return(out)
}

# Plot out each individual statistics as a function of the total number of cars in operation.
plotStats = function(statsDf) {
	
	ggdat1 = select(statsDf, additional_cars, queueLength, carsInSystem, stationsIdle, 
									probWait)
	ggdat1 = melt(ggdat1, measure.vars=c("queueLength","carsInSystem", 
																			 "stationsIdle", "probWait"))
	hash1 = c("queueLength"="Number of cars in queue", 
						"carsInSystem"="Number of cars in system", 
						"stationsIdle"="Number of stations idle", 
						"probWait"="Probability car enters queue on arrival")
	ggdat1$variable = revalue(ggdat1$variable, hash1)
	gg1 = ggplot(ggdat1, aes(x=additional_cars,y=value)) + geom_line() + 
		facet_wrap(~variable, ncol=2, nrow=2, scales="free") + 
		xlab("Additional Cars") + 
		scale_x_continuous(breaks=
											 	pretty_breaks(n=10)) + 
		scale_y_continuous(breaks=pretty_breaks(n=8)) + 
		theme(axis.title.y=element_blank(), axis.title=element_text(size=17),
		      axis.text=element_text(size=16), 
		      strip.text.x = element_text(size=16))
	
	ggdat2 = select(statsDf, additional_cars, serviceTime, queueWaitTime, overallWaitTime)
	ggdat2 = melt(ggdat2, measure.vars=c("serviceTime","queueWaitTime",
																			 "overallWaitTime"))
	hash2 = c("serviceTime"="Service time", 
						"queueWaitTime"="Queue wait time", 
						"overallWaitTime"="Total wait time")
	ggdat2$variable = revalue(ggdat2$variable, hash2)
	gg2 = ggplot(ggdat2, aes(x=additional_cars,y=value)) + geom_line() + 
		facet_wrap(~variable, ncol=2, nrow=2, scales="free") + 
		xlab("Additional Cars") + ylab("Hours") + 
		scale_x_continuous(breaks=
					 	pretty_breaks(n=10)) + 
		scale_y_continuous(breaks=pretty_breaks(n=8)) + 
	  theme(axis.title.y=element_blank(), axis.title=element_text(size=17),
	        axis.text=element_text(size=16), strip.text.x = element_text(size=16))
		
	
	return(list("gg1"=gg1, "gg2"=gg2))	
}

plotStatsPaper = function(statsDf) {
	ggdat1 = select(statsDf, n, queueLength)
	#ggdat1 = melt(ggdat1, measure.vars=c("queueLength","carsInSystem", 
	#																		 "stationsIdle", "probWait"))
	hash1 = c("queueLength"="Number of cars in queue", 
						"carsInSystem"="Number of cars in system", 
						"stationsIdle"="Number of stations idle", 
						"probWait"="Probability car enters queue on arrival")
	ggdat1$variable = revalue(ggdat1$variable, hash1)
	gg1 = ggplot(ggdat1, aes(x=n,y=queueLength)) + geom_line() + 
		xlab("Total number of cars") + 
		scale_x_continuous(breaks=
					 	pretty_breaks(n=round(max(statsDf$n-statsDf$s)/2))) + 
		scale_y_continuous(breaks=pretty_breaks(n=8)) + 
		ylab("Number of cars in the queue") + 
		theme(axis.title=element_text(size=17), 
					axis.text=element_text(size=16))
	
	ggdat2 = select(statsDf, n, queueWaitTime)
	#ggdat2 = melt(ggdat2, measure.vars=c("serviceTime","queueWaitTime",
	#																		 "overallWaitTime"))
	hash2 = c("serviceTime"="Service time", 
						"queueWaitTime"="Queue wait time", 
						"overallWaitTime"="Total wait time")
	ggdat2$variable = revalue(ggdat2$variable, hash2)
	gg2 = ggplot(ggdat2, aes(x=n,y=queueWaitTime)) + geom_line() + 
		xlab("Total number of cars") + ylab("Queue wait time in minutes") + 
		scale_x_continuous(breaks=
						 	pretty_breaks(n=round(max(statsDf$n-statsDf$s)/2))) + 
		scale_y_continuous(breaks=pretty_breaks(n=8)) + 
		theme(axis.title=element_text(size=17), 
					axis.text=element_text(size=16))
	
	ggdat3 = select(statsDf, n, probWait)
	hash3 = c("queueLength"="Number of cars in queue", 
						"carsInSystem"="Number of cars in system", 
						"stationsIdle"="Number of stations idle", 
						"probWait"="Probability car enters queue on arrival")
	ggdat3$variable = revalue(ggdat3$variable, hash3)
	gg3 = ggplot(ggdat3, aes(x=n,y=probWait)) + geom_line() + 
		xlab("Total number of cars") + 
		ylab("Chance car enters queue on arrival") + 
		scale_x_continuous(breaks=
							pretty_breaks(n=round(max(statsDf$n-statsDf$s)/2))) + 
		scale_y_continuous(breaks=pretty_breaks(n=8)) + 
		theme(axis.title=element_text(size=17), 
					axis.text=element_text(size=16))
	
	return(list("gg1"=gg1, "gg2"=gg2, "gg3"=gg3))	
}

