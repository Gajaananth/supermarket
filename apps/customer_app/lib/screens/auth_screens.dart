import 'package:flutter/material.dart';
import '../services/localization_service.dart';

/// BuyMe Splash Screen with High-Contrast Neon Ice Glass Branding
class BuyMeSplashScreen extends StatelessWidget {
  final VoidCallback onFinish;

  const BuyMeSplashScreen({super.key, required this.onFinish});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                gradient: const LinearGradient(
                  colors: [Color(0xFF168BFF), Color(0xFF0866CC)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x55168BFF),
                    blurRadius: 28,
                    offset: Offset(0, 10),
                  ),
                ],
              ),
              child: const Center(
                child: Text(
                  "D",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              "BuyMe",
              style: TextStyle(
                fontSize: 34,
                fontWeight: FontWeight.w900,
                color: Color(0xFF10243B),
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              "BATTICALOA DISTRICT • SRI LANKA",
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0866CC),
                letterSpacing: 2.0,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              "Fresh Farm & Lagoon Groceries",
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF334155),
              ),
            ),
            const SizedBox(height: 36),
            ElevatedButton(
              onPressed: onFinish,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF168BFF),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                elevation: 4,
              ),
              child: const Text("Enter BuyMe Prototype ➔", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ),
          ],
        ),
      ),
    );
  }
}

/// 3-Step Interactive Onboarding Flow
class BuyMeOnboardingScreen extends StatefulWidget {
  final VoidCallback onComplete;

  const BuyMeOnboardingScreen({super.key, required this.onComplete});

  @override
  State<BuyMeOnboardingScreen> createState() => _BuyMeOnboardingScreenState();
}

class _BuyMeOnboardingScreenState extends State<BuyMeOnboardingScreen> {
  int _pageIndex = 0;

  final List<Map<String, String>> _slides = [
    {
      "title": "Fresh Lagoon & Farm Groceries",
      "titleTa": "புதிய வாவி மற்றும் பண்ணை காய்கறிகள்",
      "desc": "Directly from Batticaloa farms and coastal lagoons with strict cold-chain freshness.",
      "descTa": "மட்டக்களப்பு பண்ணைகள் மற்றும் வாவியிலிருந்து நேரடியாக உங்கள் வீட்டிற்கு.",
      "icon": "🦐",
    },
    {
      "title": "10 Superstores in Batticaloa",
      "titleTa": "மட்டக்களப்பில் 10 கிளைகள்",
      "desc": "Town, Kattankudy, Eravur, Valaichenai, Oddamavadi, Chenkalady, Kaluwanchikudy, Arayampathy, Kiran & Vellavely.",
      "descTa": "நகரம், காத்தான்குடி, ஏறாவூர், வாழைச்சேனை உட்பட 10 கிளைகள்.",
      "icon": "🏪",
    },
    {
      "title": "Fast 30-Min Doorstep Delivery",
      "titleTa": "30 நிமிட விரைவு விநியோகம்",
      "desc": "Our dedicated fleet of motorbikes and electric scooters delivers straight to your doorstep.",
      "descTa": "எமது விரைவு ரைடர்கள் மூலம் உங்கள் இல்லத்திற்கே விநியோகம்.",
      "icon": "🛵",
    },
  ];

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_pageIndex];
    final isTa = LocalizationService.instance.isTamil;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28.0),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("BuyMe", style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF168BFF), fontSize: 20)),
                  TextButton(
                    onPressed: widget.onComplete,
                    child: const Text("Skip", style: TextStyle(color: Color(0xFF334155), fontWeight: FontWeight.bold, fontSize: 14)),
                  ),
                ],
              ),
              const Spacer(),
              Text(slide["icon"]!, style: const TextStyle(fontSize: 76)),
              const SizedBox(height: 24),
              Text(
                isTa ? slide["titleTa"]! : slide["title"]!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF10243B)),
              ),
              const SizedBox(height: 12),
              Text(
                isTa ? slide["descTa"]! : slide["desc"]!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: Color(0xFF334155), height: 1.4, fontWeight: FontWeight.w500),
              ),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(3, (idx) => Container(
                  width: idx == _pageIndex ? 24 : 8,
                  height: 8,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: idx == _pageIndex ? const Color(0xFF168BFF) : Colors.blueGrey.shade300,
                    borderRadius: BorderRadius.circular(4),
                  ),
                )),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () {
                    if (_pageIndex < 2) {
                      setState(() => _pageIndex++);
                    } else {
                      widget.onComplete();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF168BFF),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                    elevation: 3,
                  ),
                  child: Text(
                    _pageIndex == 2 ? "Get Started ➔" : "Next",
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// BuyMe Customer Login Screen with High-Contrast Form & Quick Demo Fill
class BuyMeLoginScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;
  final VoidCallback onRegisterTap;
  final VoidCallback onForgotPasswordTap;

  const BuyMeLoginScreen({
    super.key,
    required this.onLoginSuccess,
    required this.onRegisterTap,
    required this.onForgotPasswordTap,
  });

  @override
  State<BuyMeLoginScreen> createState() => _BuyMeLoginScreenState();
}

class _BuyMeLoginScreenState extends State<BuyMeLoginScreen> {
  final _phoneController = TextEditingController(text: "+94 77 123 4567");
  final _passwordController = TextEditingController(text: "buyme2026");
  bool _obscurePassword = true;
  String? _errorMessage;

  void _handleLogin() {
    final phone = _phoneController.text.trim();
    final pass = _passwordController.text.trim();

    if (phone.isEmpty || pass.isEmpty) {
      setState(() => _errorMessage = "Please enter both mobile number and password");
      return;
    }

    setState(() => _errorMessage = null);
    widget.onLoginSuccess();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: const LinearGradient(colors: [Color(0xFF168BFF), Color(0xFF0866CC)]),
                    ),
                    child: const Center(
                      child: Text("D", style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("BuyMe", style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF10243B))),
                      Text("BATTICALOA DISTRICT", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF0866CC), letterSpacing: 1.2)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 28),
              const Text(
                "Sign In to Your Account",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF10243B)),
              ),
              const SizedBox(height: 6),
              const Text(
                "Order fresh local groceries across all 10 Batticaloa stores.",
                style: TextStyle(fontSize: 13, color: Color(0xFF334155), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 24),

              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFFCA5A5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: Color(0xFF991B1B), fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),

              const Text("MOBILE NUMBER", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0866CC))),
              const SizedBox(height: 6),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w600, fontSize: 14),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.phone_android, color: Color(0xFF168BFF), size: 20),
                  filled: true,
                  fillColor: Colors.white,
                  hintText: "+94 7X XXX XXXX",
                  hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF168BFF), width: 2)),
                ),
              ),
              const SizedBox(height: 18),
              const Text("PASSWORD", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF0866CC))),
              const SizedBox(height: 6),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                style: const TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w600, fontSize: 14),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF168BFF), size: 20),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: const Color(0xFF475569), size: 20),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF168BFF), width: 2)),
                ),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: widget.onForgotPasswordTap,
                  child: const Text("Forgot Password?", style: TextStyle(color: Color(0xFF0866CC), fontWeight: FontWeight.w800, fontSize: 13)),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF168BFF),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                    elevation: 3,
                  ),
                  child: const Text("Sign In (Customer Account)", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Don't have an account? ", style: TextStyle(color: Color(0xFF334155), fontSize: 14, fontWeight: FontWeight.w500)),
                    GestureDetector(
                      onTap: widget.onRegisterTap,
                      child: const Text("Register Now", style: TextStyle(color: Color(0xFF0866CC), fontWeight: FontWeight.w800, fontSize: 14, decoration: TextDecoration.underline)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// BuyMe Customer Registration Screen with Batticaloa Locality Selector
class BuyMeRegisterScreen extends StatefulWidget {
  final VoidCallback onRegisterSuccess;
  final VoidCallback onLoginTap;

  const BuyMeRegisterScreen({
    super.key,
    required this.onRegisterSuccess,
    required this.onLoginTap,
  });

  @override
  State<BuyMeRegisterScreen> createState() => _BuyMeRegisterScreenState();
}

class _BuyMeRegisterScreenState extends State<BuyMeRegisterScreen> {
  final _nameController = TextEditingController(text: "Kajan Sivanesan");
  final _phoneController = TextEditingController(text: "+94 77 123 4567");
  final _addressController = TextEditingController(text: "14/2 Central Road, Puliyanthivu");
  final _passwordController = TextEditingController(text: "buyme2026");
  final _confirmPasswordController = TextEditingController(text: "buyme2026");
  String _selectedLocality = "Puliyanthivu";
  String? _errorMessage;

  final List<String> _localities = [
    "Puliyanthivu",
    "Koddaimunai",
    "Kattankudy",
    "Eravur",
    "Valaichenai",
    "Oddamavadi",
    "Chenkalady",
    "Kaluwanchikudy",
    "Arayampathy",
    "Kiran",
    "Vellavely",
  ];

  void _handleRegister() {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final pass = _passwordController.text.trim();
    final confirm = _confirmPasswordController.text.trim();

    if (name.isEmpty || phone.isEmpty || pass.isEmpty) {
      setState(() => _errorMessage = "Please fill in all required registration fields.");
      return;
    }

    if (pass != confirm) {
      setState(() => _errorMessage = "Passwords do not match. Please verify.");
      return;
    }

    setState(() => _errorMessage = null);
    widget.onRegisterSuccess();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7FAFF),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF10243B)),
          onPressed: widget.onLoginTap,
        ),
        title: const Text("Create BuyMe Account", style: TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w800, fontSize: 18)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Join BuyMe Batticaloa",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF10243B)),
              ),
              const SizedBox(height: 6),
              const Text(
                "Fresh groceries from 10 Batticaloa stores delivered in 30-45 mins.",
                style: TextStyle(fontSize: 13, color: Color(0xFF334155), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 20),

              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFFCA5A5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: Color(0xFF991B1B), fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),

              const Text("FULL NAME", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0866CC))),
              const SizedBox(height: 6),
              TextField(
                controller: _nameController,
                style: const TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w600, fontSize: 14),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.person_outline, color: Color(0xFF168BFF), size: 20),
                  filled: true,
                  fillColor: Colors.white,
                  hintText: "e.g. Kajan Sivanesan",
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
              ),
              const SizedBox(height: 16),

              const Text("MOBILE NUMBER (SRI LANKA)", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0866CC))),
              const SizedBox(height: 6),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w600, fontSize: 14),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.phone_android, color: Color(0xFF168BFF), size: 20),
                  filled: true,
                  fillColor: Colors.white,
                  hintText: "+94 77 123 4567",
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
              ),
              const SizedBox(height: 16),

              const Text("BATTICALOA LOCALITY", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0866CC))),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedLocality,
                    isExpanded: true,
                    icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF168BFF)),
                    style: const TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w700, fontSize: 14),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedLocality = val);
                    },
                    items: _localities.map((loc) => DropdownMenuItem(value: loc, child: Text(loc))).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              const Text("STREET ADDRESS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0866CC))),
              const SizedBox(height: 6),
              TextField(
                controller: _addressController,
                style: const TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w600, fontSize: 14),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.home_outlined, color: Color(0xFF168BFF), size: 20),
                  filled: true,
                  fillColor: Colors.white,
                  hintText: "Door No, Street Name",
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
              ),
              const SizedBox(height: 16),

              const Text("CREATE PASSWORD", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0866CC))),
              const SizedBox(height: 6),
              TextField(
                controller: _passwordController,
                obscureText: true,
                style: const TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w600, fontSize: 14),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF168BFF), size: 20),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
              ),
              const SizedBox(height: 16),

              const Text("CONFIRM PASSWORD", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0866CC))),
              const SizedBox(height: 6),
              TextField(
                controller: _confirmPasswordController,
                obscureText: true,
                style: const TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w600, fontSize: 14),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.lock_reset, color: Color(0xFF168BFF), size: 20),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _handleRegister,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF168BFF),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                    elevation: 3,
                  ),
                  child: const Text("Register BuyMe Account", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                ),
              ),
              const SizedBox(height: 20),

              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Already have an account? ", style: TextStyle(color: Color(0xFF334155), fontSize: 14, fontWeight: FontWeight.w500)),
                    GestureDetector(
                      onTap: widget.onLoginTap,
                      child: const Text("Sign In", style: TextStyle(color: Color(0xFF0866CC), fontWeight: FontWeight.w800, fontSize: 14, decoration: TextDecoration.underline)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// BuyMe Forgot Password & OTP Screen
class BuyMeForgotPasswordScreen extends StatefulWidget {
  final VoidCallback onBackToLogin;
  final VoidCallback onOtpVerified;

  const BuyMeForgotPasswordScreen({
    super.key,
    required this.onBackToLogin,
    required this.onOtpVerified,
  });

  @override
  State<BuyMeForgotPasswordScreen> createState() => _BuyMeForgotPasswordScreenState();
}

class _BuyMeForgotPasswordScreenState extends State<BuyMeForgotPasswordScreen> {
  final _phoneController = TextEditingController(text: "+94 77 123 4567");
  final _otpController = TextEditingController(text: "8492");
  bool _otpSent = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7FAFF),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF10243B)),
          onPressed: widget.onBackToLogin,
        ),
        title: const Text("Reset Password", style: TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w800, fontSize: 18)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Forgot Your Password?", style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF10243B))),
              const SizedBox(height: 8),
              const Text(
                "Enter your registered Sri Lankan mobile number to receive a 4-digit verification code.",
                style: TextStyle(fontSize: 13, color: Color(0xFF334155), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 24),

              const Text("MOBILE NUMBER", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0866CC))),
              const SizedBox(height: 6),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w600, fontSize: 14),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.phone_android, color: Color(0xFF168BFF), size: 20),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                ),
              ),
              const SizedBox(height: 16),

              if (!_otpSent)
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() => _otpSent = true);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Demo OTP sent to +94 77 123 4567: 8492")),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF168BFF),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                    ),
                    child: const Text("Send Verification Code", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                  ),
                ),

              if (_otpSent) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFA7F3D0))),
                  child: const Text("A 4-digit code (8492) was sent to your phone via SMS.", style: TextStyle(color: Color(0xFF065F46), fontSize: 12, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 16),
                const Text("ENTER 4-DIGIT CODE", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0866CC))),
                const SizedBox(height: 6),
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFF10243B), fontWeight: FontWeight.w900, fontSize: 24, letterSpacing: 8),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: widget.onOtpVerified,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                    ),
                    child: const Text("Verify & Login", style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
