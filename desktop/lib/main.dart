import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:fl_chart/fl_chart.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool isDarkTheme = false;

  void toggleTheme() {
    setState(() {
      isDarkTheme = !isDarkTheme;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false, // Tambahkan baris ini
      title: 'CO Monitoring',
      theme: isDarkTheme ? ThemeData.dark() : ThemeData.light(),
      home: HomeScreen(toggleTheme: toggleTheme, isDarkTheme: isDarkTheme),
    );
  }
}

class HomeScreen extends StatefulWidget {
  final Function toggleTheme;
  final bool isDarkTheme;

  HomeScreen({required this.toggleTheme, required this.isDarkTheme});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  double ppmValue = 0.0;
  double rawValue = 0.0;
  String timestamp = '--';
  Timer? _timer;
  List<CODataPoint> historyData = [];

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(Duration(seconds: 1), (timer) {
      fetchData();
    });
  }

  Future<void> fetchData() async {
    try {
      final response = await http
          .get(Uri.parse('https://4211421036.github.io/qualityair/data.json'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          ppmValue = data['data']['ppm'].toDouble();
          rawValue = data['data']['raw_value'].toDouble();
          timestamp = data['timestamp'];
          historyData.add(CODataPoint(DateTime.now(), ppmValue));
          if (historyData.length > 24) {
            historyData.removeAt(0);
          }
        });
      } else {
        throw Exception('Failed to load data');
      }
    } catch (e) {
      print('Error fetching data: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('CO Monitoring'),
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: <Widget>[
            DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.blue,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Image.asset(
                        "lib/logo/logo.png", // Path to your logo image
                        width: 70,
                        height: 70,
                      ),
                      SizedBox(height: 5),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Text(
                            'CO Monitoring',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              widget.isDarkTheme
                                  ? Icons.wb_sunny
                                  : Icons.nights_stay,
                              color: Colors.white,
                            ),
                            onPressed: () => widget.toggleTheme(),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            ListTile(
              leading: Icon(Icons.home),
              title: Text('Home'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: Icon(Icons.history),
              title: Text('History'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) =>
                            HistoryScreen(historyData: historyData)));
              },
            ),
            ListTile(
              leading: Icon(Icons.cloud),
              title: Text('Forecast'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) =>
                            ForecastScreen(historyData: historyData)));
              },
            ),
            ListTile(
              leading: Icon(Icons.info),
              title: Text('Info'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context,
                    MaterialPageRoute(builder: (context) => InfoScreen()));
              },
            ),
          ],
        ),
      ),
      body: HomeContent(
          ppmValue: ppmValue, rawValue: rawValue, timestamp: timestamp),
    );
  }
}

class CODataPoint {
  final DateTime time;
  final double ppm;

  CODataPoint(this.time, this.ppm);
}

class HomeContent extends StatelessWidget {
  final double ppmValue;
  final double rawValue;
  final String timestamp;

  HomeContent(
      {required this.ppmValue,
      required this.rawValue,
      required this.timestamp});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AQIDisplay(ppmValue: ppmValue),
        StatsGrid(rawValue: rawValue, timestamp: timestamp),
      ],
    );
  }
}

class AQIDisplay extends StatelessWidget {
  final double ppmValue;

  AQIDisplay({required this.ppmValue});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Text(
              'CO PPM',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 10),
            Text(
              ppmValue.toStringAsFixed(1),
              style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 10),
            Text(
              _getAirQualityStatus(ppmValue),
              style: TextStyle(fontSize: 18),
            ),
          ],
        ),
      ),
    );
  }

  String _getAirQualityStatus(double ppm) {
    if (ppm <= 50) return '🟢 Safe';
    if (ppm <= 100) return '🟡 Moderate';
    if (ppm <= 150) return '🟠 Unhealthy for Sensitive Groups';
    if (ppm <= 200) return '🔴 Unhealthy';
    return '🟣 Very Dangerous';
  }
}

class StatsGrid extends StatelessWidget {
  final double rawValue;
  final String timestamp;

  StatsGrid({required this.rawValue, required this.timestamp});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            Column(
              children: [
                Text(
                  'Raw Value',
                  style: TextStyle(fontSize: 16),
                ),
                SizedBox(height: 10),
                Text(
                  rawValue.toStringAsFixed(1),
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            Column(
              children: [
                Text(
                  'Last Updated',
                  style: TextStyle(fontSize: 16),
                ),
                SizedBox(height: 10),
                Text(
                  timestamp,
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class HistoryScreen extends StatelessWidget {
  final List<CODataPoint> historyData;

  HistoryScreen({required this.historyData});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('History'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: LineChart(
          LineChartData(
            gridData: FlGridData(
              show: true,
              drawVerticalLine: true,
              getDrawingHorizontalLine: (value) {
                return FlLine(
                  color: Colors.grey.withOpacity(0.3),
                  strokeWidth: 1,
                );
              },
              getDrawingVerticalLine: (value) {
                return FlLine(
                  color: Colors.grey.withOpacity(0.3),
                  strokeWidth: 1,
                );
              },
            ),
            titlesData: FlTitlesData(
              show: true,
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 30,
                  getTitlesWidget: (value, meta) {
                    final date =
                        DateTime.fromMillisecondsSinceEpoch(value.toInt());
                    return Text('${date.hour}:${date.minute}');
                  },
                ),
              ),
              leftTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 40,
                  getTitlesWidget: (value, meta) {
                    return Text(value.toStringAsFixed(1));
                  },
                ),
              ),
              rightTitles: AxisTitles(
                sideTitles: SideTitles(showTitles: false),
              ),
              topTitles: AxisTitles(
                sideTitles: SideTitles(showTitles: false),
              ),
            ),
            borderData: FlBorderData(
              show: true,
              border: Border.all(
                color: Colors.grey.withOpacity(0.5),
                width: 1,
              ),
            ),
            lineBarsData: [
              LineChartBarData(
                spots: historyData
                    .map((point) => FlSpot(
                        point.time.millisecondsSinceEpoch.toDouble(),
                        point.ppm))
                    .toList(),
                isCurved: true,
                color: Colors.blue,
                barWidth: 3,
                belowBarData: BarAreaData(
                  show: true,
                  color: Colors.blue.withOpacity(0.1),
                ),
                dotData: FlDotData(show: false),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ForecastScreen extends StatelessWidget {
  final List<CODataPoint> historyData;

  ForecastScreen({required this.historyData});

  @override
  Widget build(BuildContext context) {
    final forecastData =
        _predictNextValues(historyData.map((point) => point.ppm).toList());

    return Scaffold(
      appBar: AppBar(
        title: Text('Forecast'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Expanded(
              child: LineChart(
                LineChartData(
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: true,
                    getDrawingHorizontalLine: (value) {
                      return FlLine(
                        color: Colors.grey.withOpacity(0.3),
                        strokeWidth: 1,
                      );
                    },
                    getDrawingVerticalLine: (value) {
                      return FlLine(
                        color: Colors.grey.withOpacity(0.3),
                        strokeWidth: 1,
                      );
                    },
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 30,
                        getTitlesWidget: (value, meta) {
                          final date = DateTime.fromMillisecondsSinceEpoch(
                              value.toInt());
                          return Text('${date.hour}:${date.minute}');
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                        getTitlesWidget: (value, meta) {
                          return Text(value.toStringAsFixed(1));
                        },
                      ),
                    ),
                    rightTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                  ),
                  borderData: FlBorderData(
                    show: true,
                    border: Border.all(
                      color: Colors.grey.withOpacity(0.5),
                      width: 1,
                    ),
                  ),
                  lineBarsData: [
                    LineChartBarData(
                      spots: forecastData
                          .map((point) => FlSpot(
                              point.time.millisecondsSinceEpoch.toDouble(),
                              point.ppm))
                          .toList(),
                      isCurved: true,
                      color: Colors.green,
                      barWidth: 3,
                      belowBarData: BarAreaData(
                        show: true,
                        color: Colors.green.withOpacity(0.1),
                      ),
                      dotData: FlDotData(show: false),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 20),
            Text(
              'Recommendation: ${_getRecommendation(forecastData.last.ppm)}',
              style: TextStyle(fontSize: 18),
            ),
          ],
        ),
      ),
    );
  }

  List<CODataPoint> _predictNextValues(List<double> data) {
    final lastTime = DateTime.now();
    return List.generate(6, (index) {
      final ppm = data.last + (index + 1) * 10;
      return CODataPoint(lastTime.add(Duration(minutes: index * 5)), ppm);
    });
  }

  String _getRecommendation(double ppm) {
    if (ppm <= 50)
      return 'Air quality is good. Perfect for outdoor activities.';
    if (ppm <= 100)
      return 'Air quality is acceptable. Consider reducing prolonged outdoor activities if you are sensitive to CO.';
    if (ppm <= 150)
      return 'Members of sensitive groups may experience health effects. Limit outdoor exposure.';
    if (ppm <= 200)
      return 'Everyone may begin to experience health effects. Avoid outdoor activities.';
    return 'Health alert: everyone may experience serious health effects. Stay indoors.';
  }
}

class InfoScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Info'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'CO Levels Guide',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 10),
            Text(
              '🟢 0-50 PPM: Safe\n'
              '🟡 51-100 PPM: Moderate\n'
              '🟠 101-150 PPM: Unhealthy for Sensitive Groups\n'
              '🔴 151-200 PPM: Unhealthy\n'
              '🟣 >200 PPM: Very Dangerous',
              style: TextStyle(fontSize: 18),
            ),
          ],
        ),
      ),
    );
  }
}
