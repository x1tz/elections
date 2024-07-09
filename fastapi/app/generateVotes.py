import json
import random

# Define the possible choices
choices = [1, 2, 3, 8]

# Create an empty list to store votes
votes_data = []

# Generate 1000 votes
for i in range(1, 1001):
  vote = {
    "id": str(i),  # Convert user ID to string
    "choice": random.choice(choices)
  }
  votes_data.append(vote)

# Write the data to a JSON file
with open('votes.json', 'w') as outfile:
  json.dump(votes_data, outfile)

print("1000 votes generated and saved to votes.json")

#python generateVotes.py
for i in range(1, 1001):
  print(i)
