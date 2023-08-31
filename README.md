# mangrove-price-api

This service takes as configuration a list of exchanges, pair and timeframes and then fetch periodically
the OHLCV values from the exchange at each specify timefram. It's then expose those values through
a REST API.

The objective of this service is to have a reliable price api based on popular CEX.
