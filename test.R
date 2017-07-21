
rm(list=ls())

source("queuing-modeller.R")

lambda_arr = c(1.17, 1.58, 2, 2.42, 2.83, 3.24, 3.66, 4.08)
mu = 1/2.27
s = 10

rho_arr = lambda_arr/mu

for(i in 1:length(lambda_arr)) {
  print(computeProbWait(rho_arr[i], s))
}

for(i in 1:length(lambda_arr)) {
  print(computeWaitingTimeInQueue(rho_arr[i], s, mu))
}

