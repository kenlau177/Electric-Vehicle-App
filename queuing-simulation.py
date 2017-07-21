import numpy as np
import matplotlib.pyplot as plt
import csv

def sim_mmc(ncust, lmda, mu, s):
  at = np.zeros(ncust) # arrival times
  ft = np.zeros(ncust) # finish times

  # generate inter-arrival times, exponential
  iat = np.random.exponential(1/lmda, size=ncust)
  at[0] = iat[0] # arrive time of first customer

  for i in range(1,ncust):
    at[i] = at[i-1] + iat[i]

  # generate random service times for each customer
  st = np.random.exponential(1/mu, size=ncust)
  st1 = np.zeros(s)

  def update_stations(x, st1):
    out = st1
    idx = np.argmin(st1)
    out[idx] = x
    return out

  # compute time each customer finishes
  ft[0] = at[0] + st[0]
  st1[0] = ft[0]
  for i in range(1,ncust):
    # compute finish time for each customer as the larger of
    # - arrival time plus service time (if no wait)
    # - finish time of next available plus service time
    ft[i] = max(at[i] + st[i], np.min(st1) + st[i])
    st1 = update_stations(ft[i], st1)

  total_time = ft - at
  wait_time = total_time - st

  return({"wait_time":sum(wait_time)/ncust, "prob_wait":sum(wait_time>1e-7)/ncust})

lmda = 1.17 # average time each customer arrives
mu = 1/2.27 # time to serve a customer
s = 10
ncust = 100000

sim_mmc(ncust, lmda, mu, s)

# Get a sampling error estimate
sim_output = [];
for i in range(0,2227):
  if i % 500 == 0:
    print(i)
  sim_output.append(sim_mmc(ncust, lmda, mu, s)['wait_time'])

fig, ax = plt.subplots()
ax.hist(np.asarray(sim_output), bins=40)

# Check that the function is correct for different lambdas
lmda_arr = [1.17, 1.58, 2, 2.42, 2.83, 3.24, 3.66, 4.08]
for lmda in lmda_arr:
  print(sim_mmc(ncust, lmda, mu, s))

# Same function, but with a gamma function charging rate
# Let mu be the average charging duration
def sim_mmc_gamma(ncust, lmda, mu, s):
  at = np.zeros(ncust) # arrival times
  ft = np.zeros(ncust) # finish times

  # generate inter-arrival times, exponential
  iat = np.random.exponential(1/lmda, size=ncust)
  at[0] = iat[0] # arrive time of first customer

  for i in range(1,ncust):
    at[i] = at[i-1] + iat[i]

  # generate random service times for each customer
  #st = np.random.exponential(1/mu, size=ncust)
  st = np.random.gamma(5, scale=1/(mu*5), size=ncust)
  st1 = np.zeros(s)

  def update_stations(x, st1):
    out = st1
    idx = np.argmin(st1)
    out[idx] = x
    return out

  # compute time each customer finishes
  ft[0] = at[0] + st[0]
  st1[0] = ft[0]
  for i in range(1,ncust):
    # compute finish time for each customer as the larger of
    # - arrival time plus service time (if no wait)
    # - finish time of next available plus service time
    ft[i] = max(at[i] + st[i], np.min(st1) + st[i])
    st1 = update_stations(ft[i], st1)

  total_time = ft - at
  wait_time = total_time - st

  return({"lambda":lmda, "wait_time":sum(wait_time)/ncust, "prob_wait":sum(wait_time>1e-7)/ncust})

# Check that the function is correct for different lambdas
ncust = 2000000
lmda_arr = [1.17, 1.58, 2, 2.42, 2.83, 3.24, 3.66, 4.08]
mmc_gamma_output = []
for lmda in lmda_arr:
  print(lmda)
  mmc_gamma_output.append(sim_mmc_gamma(ncust, lmda, mu, s))

keys = mmc_gamma_output[0].keys()
with open('mmc_gamma_output.csv', 'w') as f:
  dict_writer = csv.DictWriter(f, keys)
  dict_writer.writeheader()
  dict_writer.writerows(mmc_gamma_output)

# Look at comparing exponential and gamma
fig, ax = plt.subplots()
ax.hist(np.random.gamma(1, scale=1/(mu*1), size=ncust), bins=40)
exp_arr = np.random.gamma(1, scale=1/(mu*1), size=ncust)
sum(exp_arr > exp_arr.mean())/ncust

fig, ax = plt.subplots()
ax.hist(np.random.gamma(5, scale=1/(mu*5), size=ncust), bins=40)
gamma_arr = np.random.gamma(5, scale=1/(mu*5), size=ncust)
sum(gamma_arr > gamma_arr.mean())/ncust

# Other code
# import numpy as np
# import math
# import Queue
#
# class Queue:
#     def __init__(self):
#         self.items = []
#
#     def isEmpty(self):
#         return self.items == []
#
#     def enqueue(self, item):
#         self.items.insert(0,item)
#
#     def dequeue(self):
#         return self.items.pop()
#
#     def size(self):
#         return len(self.items)
#
# lmda = 1
# mu = 1.5
#
# def update_next_arrival():
#   keep_track['cars_count'] = keep_track['cars_count'] + 1
#   current_arrival_time = update_table['next_arrival']
#   for k in update_table:
#     update_table[k] = update_table[k] - current_arrival_time
#   update_table['next_arrival'] = np.random.exponential(1/lmda)
#   keep_track['total_wait_time'] = keep_track['total_wait_time'] + q.size()*current_arrival_time
#   # See if there is an empty station
#   for k, v in update_table.items():
#     if 'station' in k and v == math.inf:
#       update_table[k] = np.random.exponential(1/mu)
#       return
#   # If no empty station put the car in the queue
#   q.enqueue(np.random.exponential(1/mu))
#   return
#
# def update_station(station_id):
#   keep_track['total_wait_time'] = keep_track['total_wait_time'] + q.size()*update_table[station_id]
#   for k in update_table:
#     update_table[k] = update_table[k] - update_table[station_id]
#   if q.size() > 0:
#     q_pop = q.dequeue()
#     #print(q_pop)
#     update_table[station_id] = q_pop
#   else:
#     update_table[station_id] = math.inf
#   return
#
# def update():
#   next_activity = min(update_table, key=update_table.get)
#   #print(next_activity)
#   #print('queue: ' + str(q.size()))
#   if next_activity == 'next_arrival':
#     update_next_arrival()
#   else:
#     update_station(next_activity)
#
# update_table = {'next_arrival': np.random.exponential(1/lmda),
#          'station1': np.random.exponential(1/mu),
#          'station2': np.random.exponential(1/mu),
#          'station3': np.random.exponential(1/mu),
#          'station4': np.random.exponential(1/mu),
#          'station5': np.random.exponential(1/mu),
#          'station6': math.inf,
#          'station7': math.inf,
#          'station8': math.inf,
#          'station9': math.inf,
#          'station10': math.inf
# }
#
# update_table = {'next_arrival': np.random.exponential(1/lmda),
#          'station1': np.random.exponential(1/mu),
# }
#
# keep_track = {
#         'total_wait_time': 0,
#         'cars_count': 0
# }
#
# q = Queue()
#
# for i in range(10000):
#   #print(keep_track)
#   #print(q.size())
#   update()
#
# print((keep_track['total_wait_time']/keep_track['cars_count']))
#
#
#
