
## Helper functions for model validation

# Computes the frequencies of no arrivals by computing the number of arrivals (Start_Time_hr) that falls outside of the lower and upper range for each day. 
#
# Parameters
# ----------
# x : data set containing all the input data
# lower : lower range time of day
# upper : upper range time of day
#
# Returns
# -------
# frequency of no arrivals
computeCount0 = function(x, lower, upper) {
	out = group_by(x, start_date) %>% 
		summarise(bool=all((Start_Time_hr<lower | Start_Time_hr>upper)))
	return(sum(out$bool))	
}

# Compute the estimate of the arrival rate within lower and upper times based on the frequencies we computed in allCounts.
# Based on the sample mean estimate of the observed number of arrivals.
computeArrivalRate = function(allCounts) {
	c1 = sum(as.numeric(names(allCounts))*allCounts)
	c2 = sum(allCounts)
	return(c1/c2)
}



