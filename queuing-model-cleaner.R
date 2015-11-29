
## Additional functions to clean the data before fitting the queuing model

cleanDat = function(x) {
	out = filter(x, (dayOfWeek!="Saturday") & (dayOfWeek!="Sunday") & 
							 	charging_duration > 1)
	out = ddply(out, .variables=.(EVSE_ID,start_date), 
							 .fun=removeOverlaps)
	out = ddply(out, .variables=.(EVSE_ID,start_date), 
							 .fun=aggregateCloseTimes)
	return(out)
}

# Remove data where there is a significant overlap in charging times. In 
#  fact there were some times where there were readings that seem to be 
#  duplicated as a result of the overlap
removeOverlaps = function(x) {
	#x = subset(dat, EVSE_ID=="86203" & start_date=="2015-02-06")
	temp = select(x, Start_Time, End_Time, duration)
	temp$Start_Time = as.POSIXct(x$Start_Time)
	temp$End_Time = as.POSIXct(x$End_Time)
	temp = arrange(temp, Start_Time)	
	idxRemove = c()
	
	for(i in 1:(nrow(temp)-1)) {
		for(j in 2:(i+1)) {
			a = temp$Start_Time[i]
			b = temp$Start_Time[j]
			gapTime = difftime(b, a, units="mins")
			d = temp$duration[i] - (gapTime)
			#print(d)
			if(length(d) == 0) {
				next
			}
			if(is.na(d)) {
				next
			}
			# d is in minutes
			if(d > 3) {
				if(temp$duration[i] > temp$duration[j]) {
					idxRemove = c(idxRemove, i)
				}
			}
		}
	}
	idxRemove = unique(idxRemove)	
	if(length(idxRemove) == 0 & is.null(idxRemove)) {
		return(x)
	} else {
		out = x[-idxRemove,]
		return(out)
	}	
}
# If different sessions seem to belong in one session, then aggregate the 
#  charging times together.
# There were instances where the user seems to have unplugged for a split 
#  moment and plugged back again.
aggregateCloseTimes = function(x) {
	temp = select(x, Start_Time, End_Time, duration)
	temp$Start_Time = as.POSIXct(x$Start_Time)
	temp$End_Time = as.POSIXct(x$End_Time)
	temp = arrange(temp, Start_Time)	
	out = x
	idxAgg = c()
	
	for(i in 1:(nrow(temp)-1)) {
		gapTime = difftime(temp$Start_Time[i+1],temp$End_Time[i],units="mins")
		#print(gapTime)
		if(length(gapTime) == 0) {
			next
		}
		if(is.na(gapTime)) {
			next
		}
		if(gapTime < 5 & gapTime > 0) {
			idxAgg = c(idxAgg, i+1)
		}
	}
	#print(idxAgg)
	if(is.null(idxAgg)) {
		return(out)
	}
	
	for(i in 1:(nrow(temp)-1)) {
		if((i+1)%in%idxAgg) {
			out$End_Time[i] = x$End_Time[i+1]
			out$charging_duration[i] = out$charging_duration[i] + 
				x$charging_duration[i+1]
		}
	}
	
	out = out[-idxAgg,]		
	return(out)	
}

